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
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// --- Custom Component and Utility Imports ---
import Header from "@/components/Header";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import FlipButton from "@/components/FlipButton";
import ImageViewModal from "@/components/ImageViewModal";
import StyledText from "@/components/StyledText";
import { Globals } from "@/app/constants/Globals";
import { useSettings } from "@/context/SettingsContext";
import { Card, Spinner, YStack } from "tamagui";

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
  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;

  // --- START: Language and Layout Direction Logic ---
  // The isRTL flag will be used to control component props and styles
  const isRTL = settings.language === "he";
  // --- END: Language and Layout Direction Logic ---

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
  const [isGenerating, setIsGenerating] = useState(false);

  const hasUnsavedChanges = () => {
    return (
      eventName.trim() !== "" ||
      description.trim() !== "" ||
      location.trim() !== "" ||
      capacity.trim() !== "" ||
      imageUri !== null
    );
  };

  // --- Image Handling Logic (unchanged) ---
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
        if (imageUri) {
          await safeDeleteFile(imageUri);
        }
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

  const generateAiImage = async () => {
    Keyboard.dismiss();
    if (!eventName.trim() && !description.trim()) {
      Alert.alert(t("Common_Error"), t("NewActivity_GenAI_PromptError"));
      return;
    }

    setIsGenerating(true);
    try {
      const authToken = await AsyncStorage.getItem("jwt");
      const prompt = `An exciting activity: ${eventName.trim()}. ${description.trim()}`;

      const response = await fetch(`${API}/api/Gemini/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate image.");
      }

      const responseData = await response.json();
      let base64Code = null;

      const dataKey = Object.keys(responseData).find(
        (key) =>
          Array.isArray(responseData[key]) &&
          responseData[key].length > 0 &&
          typeof responseData[key][0] === "string"
      );

      if (dataKey) {
        base64Code = responseData[dataKey][0];
      }

      if (!base64Code) {
        throw new Error(
          "Could not automatically find image data in the API response. The response format may have changed."
        );
      }

      const filename = `aigen-${Date.now()}.jpeg`;
      const destinationUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(destinationUri, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (imageUri) {
        await safeDeleteFile(imageUri);
      }
      setImageUri(destinationUri);
    } catch (err) {
      Alert.alert(t("Common_Error"), err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeStartTime = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (event.type === "set" && selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onChangeEndTime = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (event.type === "set" && selectedTime) {
      setEndTime(selectedTime);
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

  // --- Data Submission Logic (unchanged) ---
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
    }
  };

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
    let uploadedPicId = null;

    try {
      const currentUserId = (await AsyncStorage.getItem("userID"))?.replace(
        /"/g,
        ""
      );
      const authToken = await AsyncStorage.getItem("jwt");
      if (!currentUserId || !authToken)
        throw new Error("Authentication details are missing.");

      if (imageUri) {
        uploadedPicId = await uploadImage(imageUri, currentUserId);
      }

      const finalStartDate = new Date(date);
      finalStartDate.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        0,
        0
      );

      const finalEndDate = new Date(date);
      finalEndDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      const payload = {
        EventName: eventName.trim(),
        Description: description.trim(),
        HostId: currentUserId,
        Location: location.trim(),
        PictureId: uploadedPicId,
        Capacity: parseInt(capacity, 10),
        StartDate: finalStartDate.toISOString(),
        EndDate: finalEndDate.toISOString(),
      };

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
        throw new Error(errorText || "Failed to create activity.");
      }

      Toast.show({
        type: "success",
        text1: t("NewActivity_SuccessTitle"),
        text2: t("NewActivity_SuccessMessage"),
      });

      router.setParams({ refresh: new Date().getTime().toString() });
      router.back();
    } catch (err) {
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
        style={styles.screenContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerPlaque}>
            <StyledText style={styles.title}>
              {t("NewActivity_Title")}
            </StyledText>
          </View>

          <View style={styles.formPlaque}>
            <FloatingLabelInput
              label={t("NewActivity_Name")}
              value={eventName}
              onChangeText={setEventName}
              maxLength={100}
              alignRight={isRTL}
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
              inputStyle={styles.descriptionInput}
              maxLength={500}
              alignRight={isRTL}
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
              alignRight={isRTL}
            />

            <FloatingLabelInput
              label={t("NewActivity_Capacity")}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              alignRight={isRTL}
              size={30}
            />
            {formErrors.capacity && (
              <StyledText style={styles.errorText}>
                {formErrors.capacity}
              </StyledText>
            )}

            <StyledText style={styles.imageSectionTitle}>
              {t("NewActivity_Image")}
            </StyledText>
            <Card
              elevate
              width="100%"
              height={useColumnLayout ? 250 : 180}
              borderRadius="$4"
              overflow="hidden"
              onPress={viewOrPickImage}
              borderWidth={1}
              borderColor="#ddd"
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
                <YStack f={1} jc="center" ai="center" p="$2" bg="#f8f9fa">
                  <StyledText style={styles.imageCardHeader}>
                    {t("NewActivity_Image")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("NewActivity_Image_Optional")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("NewActivity_Image_TapToChoose")}
                  </StyledText>
                </YStack>
              )}
            </Card>

            <FlipButton
              onPress={generateAiImage}
              style={[
                styles.genAiButton,
                useColumnLayout && styles.fullWidthButton,
              ]}
              disabled={
                isGenerating || !eventName.trim() || !description.trim()
              }
            >
              {isGenerating ? (
                <Spinner color="black" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="sparkles"
                    size={22}
                    style={{ marginRight: 8 }}
                  />
                  <StyledText style={styles.buttonLabel}>
                    {t("NewActivity_GenAI_Button")}
                  </StyledText>
                </View>
              )}
            </FlipButton>

            <StyledText style={styles.sectionTitle}>
              {t("EventFocus_Date")}
            </StyledText>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <StyledText style={styles.pickerButtonText}>
                {date.toLocaleDateString("en-GB")}
              </StyledText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <View
              style={[
                styles.timeRow,
                useColumnLayout && styles.timeColumn,
                !useColumnLayout && isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <View style={styles.timePickerContainer}>
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
              <View style={styles.timePickerContainer}>
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

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeStartTime}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeEndTime}
              />
            )}

            <View
              style={[
                styles.buttonRow,
                useColumnLayout && styles.buttonColumn,
                !useColumnLayout && isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <FlipButton
                onPress={handleCancel}
                style={[
                  styles.cancelButton,
                  useColumnLayout && styles.fullWidthButton,
                ]}
                disabled={isSubmitting || isGenerating}
              >
                <StyledText style={styles.buttonLabel}>
                  {t("NewActivity_CancelButton")}
                </StyledText>
              </FlipButton>
              <FlipButton
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  useColumnLayout && styles.fullWidthButton,
                ]}
                disabled={isSubmitting || isGenerating}
                bgColor="#007bff"
                textColor="#fff"
              >
                {isSubmitting ? (
                  <Spinner color="white" />
                ) : (
                  <StyledText style={[styles.buttonLabel, { color: "#fff" }]}>
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
            <View
              style={[
                styles.confirmButtonRow,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <FlipButton
                onPress={() => setShowCancelConfirm(false)}
                style={styles.confirmButton}
              >
                <StyledText style={styles.buttonLabel}>
                  {t("NewActivity_KeepEditing")}
                </StyledText>
              </FlipButton>
              <FlipButton
                onPress={confirmCancel}
                style={styles.confirmButton}
                bgColor="red"
                textColor="#fff"
              >
                <StyledText style={[styles.buttonLabel, { color: "#fff" }]}>
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
  screenContainer: {
    flex: 1,
    backgroundColor: "#f7e7ce", // Champagne background
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 80,
  },
  headerPlaque: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formPlaque: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    color: "#444",
    marginTop: 20,
    marginBottom: 10,
  },
  imageSectionTitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    color: "#444",
    marginTop: 20,
    paddingBottom: 8,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imageCardHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  imageCardParagraph: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
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
    gap: 10,
  },
  timeColumn: {
    flexDirection: "column",
    gap: 15,
  },
  timePickerContainer: {
    flex: 1,
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
  buttonColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  submitButton: { width: "48%" },
  cancelButton: { width: "48%", backgroundColor: "#f0f0f0" },
  fullWidthButton: {
    width: "100%",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    width: "100%", // Ensure the container takes full width to allow text alignment
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
  confirmButton: {
    width: "48%",
  },
  genAiButton: {
    marginTop: 15,
    backgroundColor: "#e6f7ff",
  },
});
