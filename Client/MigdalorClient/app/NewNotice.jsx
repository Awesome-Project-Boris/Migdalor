import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Toast } from 'toastify-react-native'; 

import FloatingLabelInput from '@/components/FloatingLabelInput'; 
import FlipButton from '@/components/FlipButton'; 
import Header from '@/components/Header';  
import { useAuth } from '@/context/AuthProvider'; 
import { Globals } from '@/app/constants/Globals';
import { useTranslation } from 'react-i18next'; 

const SCREEN_WIDTH = Dimensions.get('window').width;

const isUserAdmin = await fetch(`${Globals.API_BASE_URL}/api/People/isadmin/${currentUserId}`)

// Hardcoded categories for now - replace with DB fetch later
// Match these strings with your OH_Categories table names
const noticeCategories = ["General", "Events", "Urgent", "Maintenance", "הנהלה"]; // temp categories

export default function NewNotice() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => { // Checking userID for admin
    const fetchUserId = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          console.log("MarketplaceItemScreen: Fetched UserID from AsyncStorage:", storedUserID);
          setCurrentUserId(storedUserID);
        } else {
          console.warn("MarketplaceItemScreen: UserID not found in AsyncStorage.");
          setCurrentUserId(null); // Explicitly set to null if not found
        }
      } catch (e) {
        console.error("MarketplaceItemScreen: Failed to fetch userID from storage", e);
        setCurrentUserId(null);
      }
    };
  
    fetchUserId();
  }, []);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(noticeCategories[0]); // Default to first category
  const [isLoading, setIsLoading] = useState(false);


  const resetForm = () => {
      setTitle('');
      setMessage('');
      setSelectedCategory(noticeCategories[0]);
  }

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !message.trim() || !selectedCategory) {
      Alert.alert(t("Common_ValidationErrorTitle"), t("NewNoticeScreen_errorAllFieldsRequired"));
      return;
    }

    if (!user?.userID) {
        Alert.alert(t("Common_Error"), t("NewNoticeScreen_errorUserInfoMissing"));
        return;
    }

    setIsLoading(true);

    // --- Step 1: Create the Notice ---
    const noticePayload = {
      senderID: user.userID,
      noticeTitle: title.trim(),
      noticeMessage: message.trim(),
      noticeCategory: selectedCategory,
      // noticeSubCategory: null, // Add if implemented
    };

    let noticeCreationResult = null; // To store the result of notice creation

    try {
      console.log("Submitting Notice Payload:", noticePayload);
      const noticeApiUrl = `${Globals.API_BASE_URL}/api/Notices`; // POST endpoint for notices
      const noticeResponse = await fetch(noticeApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user.token}`, // Add if needed
        },
        body: JSON.stringify(noticePayload),
      });

      if (!noticeResponse.ok) {
        let errorMsg = `Notice Creation Failed: HTTP Error ${noticeResponse.status}`;
        try {
            const errData = await noticeResponse.json();
            errorMsg = errData.message || errData.title || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      noticeCreationResult = await noticeResponse.json(); // Get the created notice (should include noticeId)
      console.log("Notice Creation Result:", noticeCreationResult);

      Toast.show({
          type: 'success',
          text1: t("NewNoticeScreen_successTitle"),
          text2: t("NewNoticeScreen_successMessage"),
          visibilityTime: 1500 // Shorter duration before showing broadcast status
      });

      // --- Step 2: Trigger Broadcast (only if notice creation succeeded) ---
      if (noticeCreationResult && noticeCreationResult.noticeId) { // Check if we have the new notice ID
          const broadcastPayload = {
              // Match ExpoPushMessage structure
              // `to` is not needed for broadcast via SendBulkAsync
              title: noticePayload.noticeTitle, // Use the notice title
              body: noticePayload.noticeMessage.substring(0, 100) + (noticePayload.noticeMessage.length > 100 ? '...' : ''), // Use truncated message as body
              sound: "default", // Or your preferred sound
              // badge: 1, // Optional: to increment badge count
              data: JSON.stringify({ // Pass noticeId so app can navigate if notification is tapped
                  noticeId: noticeCreationResult.noticeId
              })
          };

          console.log("Sending Broadcast Payload:", broadcastPayload);
          const broadcastApiUrl = `${Globals.API_BASE_URL}/api/Notifications/broadcast`;

          try { // Nested try specifically for the broadcast part
              const broadcastResponse = await fetch(broadcastApiUrl, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      // 'Authorization': `Bearer ${user.token}`, // Add if needed
                  },
                  body: JSON.stringify(broadcastPayload),
              });

              if (!broadcastResponse.ok) {
                  let broadcastErrorMsg = `Broadcast Failed: HTTP Error ${broadcastResponse.status}`;
                  try {
                      const errData = await broadcastResponse.json();
                      broadcastErrorMsg = errData.message || errData.error || broadcastErrorMsg;
                  } catch(e) {}
                  // Don't throw here, just show a warning toast
                   console.error(broadcastErrorMsg);
                   Toast.show({ type: 'warn', text1: t("NewNoticeScreen_broadcastWarnTitle"), text2: broadcastErrorMsg });
              } else {
                  const broadcastResult = await broadcastResponse.json();
                  console.log("Broadcast Result:", broadcastResult);
                  Toast.show({ type: 'info', text1: t("NewNoticeScreen_broadcastSuccessTitle"), text2: t("NewNoticeScreen_broadcastSuccessMessage", {count: broadcastResult.recipients}) , visibilityTime: 3000 });
              }
          } catch (broadcastError) {
               console.error("Failed to send broadcast:", broadcastError);
               Toast.show({ type: 'error', text1: t("NewNoticeScreen_broadcastErrorTitle"), text2: broadcastError.message });
          }

      } else {
           console.warn("Notice created, but noticeId missing in response. Cannot send targeted broadcast data.");
           // Maybe still send a generic broadcast without the noticeId in data?
      }

      resetForm(); // Clear form after successful notice creation (regardless of broadcast status)
      // router.back(); // Optional: navigate back

    } catch (error) { // Catch errors from Notice Creation primarily
      console.error("Failed to submit notice:", error);
      Toast.show({
          type: 'error',
          text1: t("Common_Error"),
          text2: error.message || t("NewNoticeScreen_errorSubmitFailed")
      });
    } finally {
      setIsLoading(false);
    }
  }, [title, message, selectedCategory, user, router, t, resetForm]); // Added resetForm to dependencies


  return (
    <>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.pageTitle}>{t("NewNoticeScreen_title")}</Text>

            {/* Title Input */}
            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeTitleLabel")}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              // Add maxLength if needed
            />

            {/* Message Input */}
            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeMessageLabel")}
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              inputStyle={styles.multilineInput} // Style for multiline height
              multiline={true}
              numberOfLines={6} // Suggest initial height
            />

            {/* Category Picker */}
            <View style={styles.pickerContainer}>
               <Text style={styles.pickerLabel}>{t("NewNoticeScreen_categoryLabel")}</Text>
               <Picker
                 selectedValue={selectedCategory}
                 onValueChange={(itemValue, itemIndex) =>
                   setSelectedCategory(itemValue)
                 }
                 style={styles.picker}
                 itemStyle={styles.pickerItem} // Style individual items if needed
               >
                 {noticeCategories.map((category) => (
                   <Picker.Item key={category} label={category} value={category} />
                 ))}
               </Picker>
            </View>

            {/* Submit Button */}
            <FlipButton
              onPress={handleSubmit}
              style={styles.submitButton}
              bgColor="#28a745" // Green color for submit
              textColor="#ffffff"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>{t("NewNoticeScreen_publishButton")}</Text>
              )}
            </FlipButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
      flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
    padding: 20,
    backgroundColor: '#f7f9fc', // Light background
  },
  container: {
    padding: 20,
    backgroundColor: '#ffffff', // White card background
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    marginBottom: 20, // Space between inputs
  },
  multilineInput: {
    height: 120, // Specific height for multiline
    textAlignVertical: 'top', // Align text to top
  },
  pickerContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white', // Match input background feel
  },
  pickerLabel: {
      fontSize: 14,
      color: '#666',
      position: 'absolute',
      top: -10, // Position label above border
      left: 10,
      backgroundColor: '#ffffff', // Background to cover border line
      paddingHorizontal: 4,
      zIndex: 1, // Ensure label is above picker border/background
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    // iOS specific styling for items might go here if needed
    // height: 120, // Example for iOS item height
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15, // Space above button
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // Ensure text color contrasts with button background
    textAlign: 'center',
  },
});