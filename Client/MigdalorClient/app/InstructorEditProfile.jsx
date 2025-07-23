import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  I18nManager,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import BouncyButton from "@/components/BouncyButton";
import ImageViewModal from "@/components/ImageViewModal";
import ImageHistory from "@/components/ImageHistory";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";
import { Globals } from "@/app/constants/Globals";

const defaultUserImage = require("../assets/images/defaultUser.png");

export default function InstructorEditProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { initialData, initialPic } = useLocalSearchParams();
  const { settings } = useSettings();

  // --- START: Added for Unsaved Changes Warning ---
  const [showConfirm, setShowConfirm] = useState(false);
  const initialDataRef = useRef(null);
  const initialPicRef = useRef(null);
  // --- END: Added for Unsaved Changes Warning ---

  const [form, setForm] = useState({
    name: "",
    mobilePhone: "",
    email: "",
  });

  const [profilePic, setProfilePic] = useState({
    PicID: null,
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [profileImage, setProfileImage] = useState(defaultUserImage);
  const [errors, setErrors] = useState({});
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [clearedPic, setClearedPic] = useState(false);
  const [isImagePickerModalVisible, setImagePickerModalVisible] =
    useState(false);

  useEffect(() => {
    if (initialData) {
      const parsedData = JSON.parse(initialData);
      setForm(parsedData);
      initialDataRef.current = parsedData; // Store initial form data
    }
    if (initialPic) {
      const pic = JSON.parse(initialPic);
      if (pic) {
        const normalizedPic = {
          PicID: pic.picId || pic.PicID || null,
          PicName: pic.picName || pic.PicName || "",
          PicPath: pic.picPath || pic.PicPath || "",
          PicAlt: pic.picAlt || pic.PicAlt || "",
        };
        setProfilePic(normalizedPic);
        initialPicRef.current = normalizedPic; // Store initial pic data
      } else {
        const emptyPic = { PicID: null, PicName: "", PicPath: "", PicAlt: "" };
        setProfilePic(emptyPic);
        initialPicRef.current = emptyPic;
      }
    }
  }, [initialData, initialPic]);

  useEffect(() => {
    if (profilePic?.PicPath?.startsWith("file://")) {
      setProfileImage({ uri: profilePic.PicPath });
    } else if (profilePic?.PicPath) {
      setProfileImage({ uri: `${Globals.API_BASE_URL}${profilePic.PicPath}` });
    } else {
      setProfileImage(defaultUserImage);
    }
  }, [profilePic]);

  const validateField = (name, value) => {
    const isRequired = (val) => {
      if (!val || val.trim() === "") {
        return t("Validation_FieldIsRequired", "This field is required.");
      }
      return null;
    };

    if (name === "mobilePhone") {
      const requiredError = isRequired(value);
      if (requiredError) return requiredError;
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(value)) {
        return t("EditProfileScreen_errorMessageMobilePhone");
      }
    }

    if (name === "email") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        return null;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return t("EditProfileScreen_errorMessageEmail");
      }
    }
    return null;
  };

  const handleFormChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImagePress = () => {
    const isDefault =
      !profileImage.uri || profileImage.uri.includes("defaultUser.png");
    if (isDefault) {
      handleAddImage();
    } else {
      setImageToViewUri(profileImage.uri || null);
      setShowImageViewModal(true);
    }
  };

  const handleRemoveImage = () => {
    setClearedPic(true);
    setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    setShowImageViewModal(false);
  };

  const handleSelectFromHistory = (selectedImage) => {
    setProfilePic(selectedImage);
    setHistoryModalVisible(false);
    setClearedPic(false);
  };

  const copyImageToAppDir = async (sourceUri) => {
    try {
      const filename = `instructor-profile-${Date.now()}-${sourceUri
        .split("/")
        .pop()}`;
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

  const handleAddImage = () => {
    setShowImageViewModal(false); // Close the view modal first
    setImagePickerModalVisible(true); // Open the new custom modal
  };

  const handleTakePhoto = async () => {
    setImagePickerModalVisible(false);
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        t("ImagePicker_permissionDeniedTitle"),
        t("ImagePicker_cameraPermissionDeniedMessage")
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const newUri = await copyImageToAppDir(result.assets[0].uri);
        setProfilePic({
          PicPath: newUri,
          PicAlt: "Instructor Profile Picture",
        });
        setClearedPic(false);
      } catch (error) {
        Alert.alert(t("ImagePicker_errorTitle"), error.message);
      }
    }
  };

  const handleChooseFromLibrary = async () => {
    setImagePickerModalVisible(false);
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.status !== "granted") {
      Alert.alert(
        t("ImagePicker_permissionDeniedTitle"),
        t("ImagePicker_libraryPermissionDeniedMessage")
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const newUri = await copyImageToAppDir(result.assets[0].uri);
        setProfilePic({
          PicPath: newUri,
          PicAlt: "Instructor Profile Picture",
        });
        setClearedPic(false);
      } catch (error) {
        Alert.alert(t("ImagePicker_errorTitle"), error.message);
      }
    }
  };

  const handleChooseFromHistory = () => {
    setImagePickerModalVisible(false);
    setHistoryModalVisible(true);
  };

  const deletePicture = async (pictureId) => {
    if (!pictureId) return;

    const storedUserID = await AsyncStorage.getItem("userID");
    if (!storedUserID) {
      throw new Error("User ID not found, cannot delete picture.");
    }

    const response = await fetch(
      `${Globals.API_BASE_URL}/api/Picture/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          PicId: pictureId,
          UserId: storedUserID,
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = "Failed to delete old picture.";
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // Ignore if response is not JSON
      }
      throw new Error(errorMsg);
    }
    console.log(`Successfully deleted picture ID: ${pictureId}`);
  };

  const uploadImage = async (imageUri, role, altText, uploaderId) => {
    if (!imageUri || !imageUri.startsWith("file://")) {
      return null;
    }
    const formData = new FormData();
    const fileType = imageUri.substring(imageUri.lastIndexOf(".") + 1);
    const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;
    formData.append("files", {
      uri: imageUri,
      name: `${role}.${fileType}`,
      type: mimeType,
    });
    formData.append("picRoles", role);
    formData.append("picAlts", altText);
    formData.append("uploaderId", uploaderId);

    const uploadResponse = await fetch(
      `${Globals.API_BASE_URL}/api/Picture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("jwt")}`,
        },
        body: formData,
      }
    );
    const uploadResults = await uploadResponse.json();
    if (
      !uploadResponse.ok ||
      !Array.isArray(uploadResults) ||
      uploadResults.length === 0 ||
      !uploadResults[0].success
    ) {
      const errorMsg =
        uploadResults?.[0]?.errorMessage ||
        `Image upload failed (HTTP ${uploadResponse.status})`;
      throw new Error(errorMsg);
    }
    await safeDeleteFile(imageUri);
    return {
      PicID: uploadResults[0].picId,
      PicPath: uploadResults[0].serverPath,
      PicName: uploadResults[0].originalFileName,
      PicAlt: altText,
      UploaderId: uploaderId,
      PicRole: role,
      DateTime: new Date().toISOString(),
    };
  };

  const prepareFinalPicData = async (
    currentPic,
    initialPic,
    clearedFlag,
    role,
    altText
  ) => {
    if (currentPic.PicPath?.startsWith("file://")) {
      const storedUserID = await AsyncStorage.getItem("userID");
      return await uploadImage(
        currentPic.PicPath,
        role,
        altText,
        storedUserID
      );
    }
    if (clearedFlag) {
      return null;
    }
    if (currentPic.PicPath?.startsWith("/Images/")) {
      return currentPic;
    }
    return initialPic;
  };

  const handleSave = async () => {
    const phoneError = validateField("mobilePhone", form.mobilePhone);
    const emailError = validateField("email", form.email);
    const newErrors = { mobilePhone: phoneError, email: emailError };
    setErrors(newErrors);

    if (phoneError || emailError) {
      Toast.show({
        type: "error",
        text1: t("Common_ValidationErrorTitle"),
        text2: phoneError || emailError,
      });
      return;
    }

    const oldPicIdToDelete = initialPicRef.current?.PicID;
    let newlyUploadedPicData = null;

    try {
      newlyUploadedPicData = await prepareFinalPicData(
        profilePic,
        initialPicRef.current,
        clearedPic,
        "profile_picture",
        "Instructor Profile Picture"
      );

      const newPicId = newlyUploadedPicData?.PicID || null;

      const storedUserID = await AsyncStorage.getItem("userID");
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/People/UpdateInstructorProfile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({
            personId: storedUserID,
            phoneNumber: form.mobilePhone,
            email: form.email,
            profilePicId: newPicId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update profile");
      }

      const pictureWasChanged = oldPicIdToDelete !== newPicId;
      if (oldPicIdToDelete && pictureWasChanged) {
        await deletePicture(oldPicIdToDelete);
      }

      Toast.show({
        type: "success",
        text1: t("EditProfileScreen_ProfileUpdated"),
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message,
      });

      if (
        newlyUploadedPicData &&
        newlyUploadedPicData.PicPath?.startsWith("/Images/")
      ) {
        try {
          await deletePicture(newlyUploadedPicData.PicID);
          console.log("Cleaned up orphaned new image.");
        } catch (cleanupError) {
          console.error("Failed to clean up orphaned new image:", cleanupError);
        }
      }
    }
  };

  // --- START: Unsaved Changes Warning Logic ---
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    setShowConfirm(false);
    router.back();
  };

  const stayOnPage = () => {
    setShowConfirm(false);
  };

  const hasUnsavedChanges = () => {
    const initialForm = initialDataRef.current;
    const initialPicState = initialPicRef.current;
    if (!initialForm) return false;

    // Compare form fields
    if (
      String(form.mobilePhone).trim() !==
        String(initialForm.mobilePhone).trim() ||
      String(form.email).trim() !== String(initialForm.email).trim()
    ) {
      return true;
    }

    // Check for new local image
    if (profilePic.PicPath?.startsWith("file://")) {
      return true;
    }

    // Check if image was cleared or changed from history
    if (clearedPic) {
      return true;
    }

    if ((profilePic.PicID || null) !== (initialPicState?.PicID || null)) {
      return true;
    }

    return false;
  };
  // --- END: Unsaved Changes Warning Logic ---

  const isMaxFontSize = settings.fontSizeMultiplier === 3;
  const buttonContainerStyle = [
    styles.buttonRow,
    isMaxFontSize && styles.buttonColumn,
  ];
  const buttonStyle = [styles.actionButton, isMaxFontSize && { width: "85%" }];

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        <View style={styles.profileImageContainer}>
          <BouncyButton shrinkScale={0.95} onPress={handleImagePress}>
            <Image source={profileImage} style={styles.profileImage} />
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          <StyledText style={styles.profileName}>{form.name}</StyledText>
        </View>

        <View style={styles.editableContainer}>
          <FloatingLabelInput
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_mobilePhone")}
            value={form.mobilePhone}
            onChangeText={(text) => handleFormChange("mobilePhone", text)}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.mobilePhone && (
            <StyledText style={styles.errorText}>
              {errors.mobilePhone}
            </StyledText>
          )}
          <FloatingLabelInput
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_email")}
            value={form.email}
            onChangeText={(text) => handleFormChange("email", text)}
            keyboardType="email-address"
            maxLength={100}
          />
          {errors.email && (
            <StyledText style={styles.errorText}>{errors.email}</StyledText>
          )}
        </View>

        <View style={buttonContainerStyle}>
          <FlipButton
            onPress={handleSave}
            bgColor="white"
            textColor="black"
            style={buttonStyle}
          >
            <StyledText style={styles.buttonText}>
              {t("EditProfileScreen_saveButton")}
            </StyledText>
          </FlipButton>
          <FlipButton
            onPress={handleCancel}
            bgColor="white"
            textColor="black"
            style={buttonStyle}
          >
            <StyledText style={styles.buttonText}>
              {t("EditProfileScreen_cancelButton")}
            </StyledText>
          </FlipButton>
        </View>
      </ScrollView>

      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageToViewUri}
        onClose={() => setShowImageViewModal(false)}
        onAdd={handleAddImage}
        onRemove={handleRemoveImage}
      />

      <ImageHistory
        visible={isHistoryModalVisible}
        picRole="Profile picture"
        onClose={() => setHistoryModalVisible(false)}
        onSelect={handleSelectFromHistory}
        picturesInUse={[profilePic?.PicID].filter(Boolean)}
        initialPictureIdInSlot={initialPicRef.current?.PicID}
      />

      {/* --- START: Custom Image Picker Modal --- */}
      <Modal
        visible={isImagePickerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagePickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.confirmOverlay}
          activeOpacity={1}
          onPressOut={() => setImagePickerModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.imagePickerContainer}>
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{ alignItems: "center" }}
              >
                <View style={{ paddingHorizontal: 20, width: "100%" }}>
                  <StyledText
                    style={[
                      styles.imagePickerTitle,
                      {
                        textAlign:
                          Globals.userSelectedDirection === "rtl"
                            ? "right"
                            : "left",
                      },
                    ]}
                    maxFontSize={36}
                  >
                    {t("ImagePicker_selectSourceTitle")}
                  </StyledText>
                  <StyledText
                    style={[
                      styles.imagePickerMessage,
                      {
                        textAlign:
                          Globals.userSelectedDirection === "rtl"
                            ? "right"
                            : "left",
                      },
                    ]}
                    maxFontSize={30}
                  >
                    {t("ImagePicker_selectSourceMessage")}
                  </StyledText>
                </View>
                <View style={styles.imagePickerButtonContainer}>
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={handleTakePhoto}
                  >
                    <StyledText style={styles.imagePickerButtonText}>
                      {t("ImagePicker_takePhotoButton")}
                    </StyledText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={handleChooseFromLibrary}
                  >
                    <StyledText style={styles.imagePickerButtonText}>
                      {t("ImagePicker_chooseFromLibraryButton")}
                    </StyledText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={handleChooseFromHistory}
                  >
                    <StyledText style={styles.imagePickerButtonText}>
                      {t("ImagePicker_chooseFromHistoryButton", "History")}
                    </StyledText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.imagePickerButton, styles.cancelButton]}
                    onPress={() => setImagePickerModalVisible(false)}
                  >
                    <StyledText
                      style={[
                        styles.imagePickerButtonText,
                        styles.cancelButtonText,
                      ]}
                    >
                      {t("ImagePicker_cancelButton")}
                    </StyledText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      {/* --- END: Custom Image Picker Modal --- */}

      {/* --- START: Add Confirmation Modal --- */}
      {showConfirm && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmContainer}>
              <StyledText style={styles.confirmText}>
                {t(
                  "MarketplaceNewItemScreen_CancelDiscardHeader",
                  "You have unsaved changes. Are you sure you want to discard them?"
                )}
              </StyledText>
              <View style={styles.confirmButtonRow}>
                <FlipButton
                  onPress={confirmCancel}
                  bgColor="#e0e0e0"
                  textColor="black"
                  style={styles.confirmButton}
                >
                  <StyledText style={styles.buttonLabel}>
                    {t(
                      "MarketplaceNewItemScreen_CancelConfirmation",
                      "Discard"
                    )}
                  </StyledText>
                </FlipButton>
                <FlipButton
                  onPress={stayOnPage}
                  bgColor="#347af0"
                  textColor="white"
                  style={styles.confirmButton}
                >
                  <StyledText style={[styles.buttonLabel, { color: "white" }]}>
                    {t("NewActivity_KeepEditing", "Keep Editing")}
                  </StyledText>
                </FlipButton>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* --- END: Add Confirmation Modal --- */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fef1e6" },
  scroll: { alignItems: "center", paddingBottom: 60, paddingTop: 80 },
  profileImageContainer: { alignItems: "center", marginVertical: 10 },
  profileImage: {
    width: 300,
    height: 300,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileNameContainer: {
    bottom: 60,
    alignItems: "center",
    borderRadius: 70,
    paddingVertical: 12,
    marginBottom: -40,
    width: "80%",
    backgroundColor: "#fff",
    borderColor: "#000000",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileName: {
    opacity: 0.9,
    padding: 10,
    fontWeight: "bold",
    fontSize: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    textAlign: "center",
  },
  editableContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,
    gap: 30,
  },
  inputContainer: { width: "85%", alignSelf: "center" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 40,
    width: "100%",
  },
  buttonColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  buttonText: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginTop: -30,
    fontSize: 28,
    width: "90%",
    textAlign: "center",
  },
  // --- START: Add Modal Styles ---
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmContainer: {
    width: "85%",
    maxWidth: 350,
    padding: 25,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // --- END: Add Modal Styles ---
  // --- START: Custom Image Picker Modal Styles ---
  imagePickerContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 14,
    alignItems: "center",
    paddingTop: 20,
    maxHeight: "80%",
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    width: "100%",
    marginBottom: 8,
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  imagePickerMessage: {
    fontSize: 14,
    width: "100%",
    marginBottom: 20,
    color: "#333",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  imagePickerButtonContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
  },
  imagePickerButton: {
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#dbdbdb",
  },
  imagePickerButtonText: {
    fontSize: 18,
    color: "#007AFF",
  },
  cancelButton: {
    borderBottomWidth: 0, // No border for the last button
  },
  cancelButtonText: {
    fontWeight: "bold",
    color: "red",
  },
  // --- END: Custom Image Picker Modal Styles ---
});
