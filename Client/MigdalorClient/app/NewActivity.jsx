import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";
import { Image as ExpoImage } from "expo-image";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// --- Custom Component and Utility Imports ---
import Header from "@/components/Header";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import FlipButton from "@/components/FlipButton";
import ImageViewModal from "@/components/ImageViewModal";
import StyledText from "@/components/StyledText"; // <-- IMPORT STYLEDTEXT
import { Globals } from "@/app/constants/Globals";
import { Card, Spinner, YStack } from "tamagui"; // <-- REMOVED H2 AND PARAGRAPH

const SCREEN_WIDTH = Dimensions.get("window").width;
const API = Globals.API_BASE_URL;

// Reusable helper functions (unchanged)
const copyImageToAppDir = async (sourceUri, prefix) => {
  try {
    const filename = `${prefix}-${Date.now()}-${sourceUri.split("/").pop()}`;
    const destinationUri = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
    return destinationUri;
  } catch (e) {
    console.error("FileSystem.copyAsync Error:", e);
    throw e;
  }
};

const safeDeleteFile = async (uri) => {
  if (!uri || !uri.startsWith("file://")) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error(`Error deleting local file ${uri}:`, error);
  }
};

const formatTime = (date) => {
  if (!date) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function NewActivity() {
  const { t } = useTranslation();
  const router = useRouter();

  // State variables (all unchanged)
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const defaultEndTime = new Date();
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);
    return defaultEndTime;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const hasUnsavedChanges = () => {
    return (
      eventName.trim() !== "" ||
      description.trim() !== "" ||
      location.trim() !== "" ||
      capacity.trim() !== "" ||
      imageUri !== null
    );
  };

  // --- Image Handling Logic ---
  const pickImage = async () => {
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.status !== "granted") {
      Alert.alert(
        t("ImagePicker_permissionDeniedTitle"),
        t("ImagePicker_libraryPermissionDeniedMessage")
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      try {
        const newUri = await copyImageToAppDir(
          result.assets[0].uri,
          "activity"
        );
        setImageUri(newUri);
      } catch (copyError) {
        Alert.alert(
          t("ImagePicker_errorTitle"),
          t("ImagePicker_saveLibraryImageFailure")
        );
      }
    }
  };

  const viewOrPickImage = () => {
    if (imageUri) {
      setShowImageViewModal(true);
    } else {
      pickImage();
    }
  };

  const handleRemoveImage = async () => {
    await safeDeleteFile(imageUri);
    setImageUri(null);
    setShowImageViewModal(false);
  };

  const uploadImage = async (localUri, uploaderId) => {
    if (!localUri) return null;

    const formData = new FormData();
    const fileType = localUri.substring(localUri.lastIndexOf(".") + 1);
    formData.append("files", {
      uri: localUri,
      name: `activity.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append("picRoles", "activity");
    formData.append("picAlts", `Image for activity ${eventName.trim()}`);
    formData.append("uploaderId", uploaderId);

    try {
      const response = await fetch(`${API}/api/Picture`, {
        method: "POST",
        body: formData,
      });
      const results = await response.json();
      if (!response.ok || !results?.[0]?.success) {
        throw new Error(results?.[0]?.errorMessage || "Image upload failed.");
      }
      await safeDeleteFile(localUri);
      return results[0].picId;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
        text2: error.message,
      });
      throw error;
    }
  };

  // --- NEW: Function to delete an uploaded picture from the server ---
  const deletePictureOnServer = async (pictureId) => {
    if (!pictureId) return;
    console.log(`Attempting to delete orphaned picture ID: ${pictureId}`);
    try {
      const authToken = await AsyncStorage.getItem("jwt");
      await fetch(`${API}/api/Picture/${pictureId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (err) {
      console.error(`Failed to delete orphaned picture ID ${pictureId}:`, err);
      // We don't show an error to the user for this background cleanup task.
    }
  };

  // --- Validation ---
  const validateFields = () => {
    const errors = {};
    if (!eventName.trim())
      errors.eventName = t("NewActivity_Name_Error_Required");
    if (eventName.length > 100)
      errors.eventName = t("NewActivity_Name_Error_TooLong");
    if (description.length > 500)
      errors.description = t("NewActivity_Description_Error_TooLong");
    if (!capacity.trim())
      errors.capacity = t("NewActivity_Capacity_Error_Required");
    if (isNaN(parseInt(capacity, 10)) || parseInt(capacity, 10) <= 0)
      errors.capacity = t("NewActivity_Capacity_Error_Invalid");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Actions ---
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    await safeDeleteFile(imageUri);
    router.back();
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validateFields()) {
      Toast.show({
        type: "error",
        text1: t("Common_ValidationErrorTitle"),
        text2: t("Common_ValidationErrorMsg"),
      });
      return;
    }

    setIsSubmitting(true);
    let uploadedPicId = null; // --- NEW: Variable to track uploaded picture ID ---

    try {
      const currentUserId = (await AsyncStorage.getItem("userID"))?.replace(
        /"/g,
        ""
      );
      const authToken = await AsyncStorage.getItem("jwt");
      if (!currentUserId || !authToken)
        throw new Error("Authentication details are missing.");

      // --- Step 1: Upload image first ---
      if (imageUri) {
        uploadedPicId = await uploadImage(imageUri, currentUserId);
      }

      // --- Step 2: Combine Date and Time ---
      const finalStartDate = new Date(date);
      finalStartDate.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        0,
        0
      );

      const finalEndDate = new Date(date);
      finalEndDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      // --- Step 3: Create payload ---
      const payload = {
        EventName: eventName.trim(),
        Description: description.trim(),
        HostId: currentUserId,
        Location: location.trim(),
        PictureId: uploadedPicId, // Use the ID from the upload
        Capacity: parseInt(capacity, 10),
        StartDate: finalStartDate.toISOString(),
        EndDate: finalEndDate.toISOString(),
      };

      // --- Step 4: POST to the new endpoint ---
      const response = await fetch(`${API}/api/events/CreateActivity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If this fails, the 'catch' block will handle deleting the image.
        throw new Error(errorText || "Failed to create activity.");
      }

      Toast.show({
        type: "success",
        text1: t("NewActivity_SuccessTitle"),
        text2: t("NewActivity_SuccessMessage"),
      });
      router.back();
    } catch (err) {
      // --- NEW: Fallback logic ---
      // If an image was uploaded but the event creation failed, delete the image.
      if (uploadedPicId) {
        await deletePictureOnServer(uploadedPicId);
      }
      Alert.alert(t("Common_Error"), err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#fef1e6" }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <StyledText style={styles.title}>
              {t("NewActivity_Title")}
            </StyledText>

            <FloatingLabelInput
              label={t("NewActivity_Name")}
              value={eventName}
              onChangeText={setEventName}
              maxLength={100}
            />
            {formErrors.eventName && (
              <StyledText style={styles.errorText}>
                {formErrors.eventName}
              </StyledText>
            )}

            <FloatingLabelInput
              label={t("NewActivity_Description")}
              value={description}
              onChangeText={setDescription}
              multiline
              inputStyle={{ height: 120, textAlignVertical: "top" }}
              maxLength={500}
            />
            {formErrors.description && (
              <StyledText style={styles.errorText}>
                {formErrors.description}
              </StyledText>
            )}

            <FloatingLabelInput
              label={t("NewActivity_Location")}
              value={location}
              onChangeText={setLocation}
            />

            <FloatingLabelInput
              label={t("NewActivity_Capacity")}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
            {formErrors.capacity && (
              <StyledText style={styles.errorText}>
                {formErrors.capacity}
              </StyledText>
            )}

            <StyledText style={styles.sectionTitle}>
              {t("NewActivity_Image")}
            </StyledText>
            <Card
              elevate
              width="100%"
              height={180}
              borderRadius="$4"
              overflow="hidden"
              onPress={viewOrPickImage}
            >
              {imageUri ? (
                <Card.Background>
                  <ExpoImage
                    source={{ uri: imageUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                </Card.Background>
              ) : (
                <YStack f={1} jc="center" ai="center" p="$2" bg="$background">
                  {/* --- REPLACED TAMAGUI COMPONENTS --- */}
                  <StyledText style={styles.tamaguiH2}>
                    {t("NewActivity_Image")}
                  </StyledText>
                  <StyledText style={styles.tamaguiParagraph}>
                    {t("NewActivity_Image_Optional")}
                  </StyledText>
                  <StyledText style={styles.tamaguiParagraph}>
                    {t("NewActivity_Image_TapToChoose")}
                  </StyledText>
                </YStack>
              )}
            </Card>

            <StyledText style={styles.sectionTitle}>
              {t("EventFocus_Date")}
            </StyledText>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <StyledText style={styles.pickerButtonText}>
                {date.toLocaleDateString()}
              </StyledText>
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <StyledText style={styles.timeLabel}>
                  {t("NewActivity_SelectStartTime")}
                </StyledText>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <StyledText style={styles.pickerButtonText}>
                    {formatTime(startTime)}
                  </StyledText>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <StyledText style={styles.timeLabel}>
                  {t("NewActivity_SelectEndTime")}
                </StyledText>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <StyledText style={styles.pickerButtonText}>
                    {formatTime(endTime)}
                  </StyledText>
                </TouchableOpacity>
              </View>
            </View>

            {/* The DateTimePicker modals do not contain any text to change */}

            <View style={styles.buttonRow}>
              <FlipButton
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                <StyledText>{t("NewActivity_CancelButton")}</StyledText>
              </FlipButton>
              <FlipButton
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
                bgColor="#007bff"
                textColor="#fff"
              >
                {isSubmitting ? (
                  <Spinner color="white" />
                ) : (
                  <StyledText style={styles.submitButtonText}>
                    {t("NewActivity_CreateButton")}
                  </StyledText>
                )}
              </FlipButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageUri}
        onClose={() => setShowImageViewModal(false)}
        onRemove={handleRemoveImage}
      />

      <Modal
        visible={showCancelConfirm}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <StyledText style={styles.confirmText}>
              {t("NewActivity_CancelPromptMessage")}
            </StyledText>
            <View style={styles.confirmButtonRow}>
              <FlipButton
                onPress={() => setShowCancelConfirm(false)}
                style={styles.confirmButton}
              >
                <StyledText>{t("NewActivity_KeepEditing")}</StyledText>
              </FlipButton>
              <FlipButton
                onPress={confirmCancel}
                style={styles.confirmButton}
                bgColor="red"
                textColor="#fff"
              >
                <StyledText style={{ color: "#fff" }}>
                  {t("NewActivity_ConfirmDiscard")}
                </StyledText>
              </FlipButton>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingTop: 80,
  },
  formContainer: {
    width: SCREEN_WIDTH * 0.9,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginTop: 20,
    marginBottom: 10,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  pickerButtonText: {
    fontSize: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeLabel: {
    textAlign: "center",
    marginBottom: 5,
    fontSize: 16,
    color: "#555",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  submitButton: { width: "48%" },
  cancelButton: { width: "48%", backgroundColor: "#f0f0f0" },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: -10,
    marginBottom: 10,
    fontSize: 12,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmContainer: {
    width: "85%",
    padding: 25,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 24,
  },
  confirmButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: { width: "48%" },
});
