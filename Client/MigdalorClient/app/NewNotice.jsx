import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Toast } from "toastify-react-native";

import FloatingLabelInput from "@/components/FloatingLabelInput";
import FlipButton from "@/components/FlipButton";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthProvider";
import { Globals } from "@/app/constants/Globals";
import { useTranslation } from "react-i18next";

const SCREEN_WIDTH = Dimensions.get("window").width;

const noticeCategories = [
  "General",
  "Events",
  "Urgent",
  "Maintenance",
  "הנהלה",
];

export default function NewNotice() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          console.log(
            "MarketplaceItemScreen: Fetched UserID from AsyncStorage:",
            storedUserID
          );
          setCurrentUserId(storedUserID);
        } else {
          console.warn(
            "MarketplaceItemScreen: UserID not found in AsyncStorage."
          );
          setCurrentUserId(null);
        }
      } catch (e) {
        console.error(
          "MarketplaceItemScreen: Failed to fetch userID from storage",
          e
        );
        setCurrentUserId(null);
      }
    };

    fetchUserId();
  }, []);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(noticeCategories[0]);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setSelectedCategory(noticeCategories[0]);
  };

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !message.trim() || !selectedCategory) {
      Alert.alert(
        t("Common_ValidationErrorTitle"),
        t("NewNoticeScreen_errorAllFieldsRequired")
      );
      return;
    }

    if (!user?.userID) {
      Alert.alert(t("Common_Error"), t("NewNoticeScreen_errorUserInfoMissing"));
      return;
    }

    setIsLoading(true);

    const noticePayload = {
      senderID: user.userID,
      noticeTitle: title.trim(),
      noticeMessage: message.trim(),
      noticeCategory: selectedCategory,
    };

    console.log("Submitting Notice Payload:", noticePayload);

    try {
      const apiUrl = `${Globals.API_BASE_URL}/api/Notices`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticePayload),
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.title || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("Notice Submission Result:", result);

      Toast.show({
        type: "success",
        text1: t("NewNoticeScreen_successTitle"),
        text2: t("NewNoticeScreen_successMessage"),
      });

      resetForm();
    } catch (error) {
      console.error("Failed to submit notice:", error);
      Toast.show({
        type: "error",
        text1: t("Common_Error"),
        text2: error.message || t("NewNoticeScreen_errorSubmitFailed"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [title, message, selectedCategory, user, router, t]);

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
            />

            {/* Message Input */}
            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeMessageLabel")}
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              inputStyle={styles.multilineInput}
              multiline={true}
              numberOfLines={6}
            />

            {/* Category Picker */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>
                {t("NewNoticeScreen_categoryLabel")}
              </Text>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedCategory(itemValue)
                }
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {noticeCategories.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>

            {/* Submit Button */}
            <FlipButton
              onPress={handleSubmit}
              style={styles.submitButton}
              bgColor="#28a745"
              textColor="#ffffff"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("NewNoticeScreen_publishButton")}
                </Text>
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
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f7f9fc",
  },
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    marginBottom: 20,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
  },
  pickerLabel: {
    fontSize: 14,
    color: "#666",
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {},
  submitButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
});
