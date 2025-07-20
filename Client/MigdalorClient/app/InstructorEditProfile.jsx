import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
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
import ImageViewModal from "../components/ImageViewModal";
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

  const [form, setForm] = useState({
    name: "",
    mobilePhone: "",
    email: "",
  });

  // --- CHANGE: State is now an object, not null, to prevent errors ---
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

  useEffect(() => {
  if (initialData) {
    setForm(JSON.parse(initialData));
  }
  if (initialPic) {
    const pic = JSON.parse(initialPic);
    if (pic) {
      // Normalize the data structure to use PicID
      setProfilePic({
        PicID: pic.picId || pic.PicID || null, // Accept either format
        PicName: pic.picName || pic.PicName || "",
        PicPath: pic.picPath || pic.PicPath || "",
        PicAlt: pic.picAlt || pic.PicAlt || "",
      });
    } else {
      setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
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
      const requiredError = isRequired(trimmedValue);
      if (requiredError) return requiredError;
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
    if (!profilePic?.picPath) {
      handleAddImage();
    } else {
      setImageToViewUri(profileImage.uri || null);
      setShowImageViewModal(true);
    }
  };

  // --- CHANGE: Logic now matches EditProfile ---
  const handleRemoveImage = () => {
    setClearedPic(true);
    setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    setShowImageViewModal(false);
  };
  
  // --- CHANGE: Logic now matches EditProfile ---
  const handleSelectFromHistory = (selectedImage) => {
    setProfilePic(selectedImage);
    setHistoryModalVisible(false);
    setClearedPic(false);
  };

  const copyImageToAppDir = async (sourceUri) => {
    try {
      const filename = `instructor-profile-${Date.now()}-${sourceUri.split("/").pop()}`;
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

  const pickImage = async (source) => {
    setShowImageViewModal(false);
    let result;
    try {
        if (source === 'camera') {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== 'granted') {
                Alert.alert(t("ImagePicker_permissionDeniedTitle"), t("ImagePicker_cameraPermissionDeniedMessage"));
                return;
            }
            result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
        } else {
            const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (libraryPermission.status !== 'granted') {
                Alert.alert(t("ImagePicker_permissionDeniedTitle"), t("ImagePicker_libraryPermissionDeniedMessage"));
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
        }

        if (!result.canceled && result.assets?.[0]?.uri) {
          const newUri = await copyImageToAppDir(result.assets[0].uri);
          setProfilePic({ PicPath: newUri, PicAlt: "Instructor Profile Picture" });
          setClearedPic(false);
        }
    } catch (error) {
        Alert.alert(t("ImagePicker_errorTitle"), error.message);
    }
  };

  const handleAddImage = () => {
     Alert.alert(
      t("ImagePicker_selectSourceTitle"),
      t("ImagePicker_selectSourceMessage"),
      [
        { text: t("ImagePicker_takePhotoButton"), onPress: () => pickImage('camera') },
        { text: t("ImagePicker_chooseFromLibraryButton"), onPress: () => pickImage('gallery') },
        { text: t("ImagePicker_chooseFromHistoryButton"), onPress: () => {
            setShowImageViewModal(false);
            setHistoryModalVisible(true);
        }},
        { text: t("ImagePicker_cancelButton"), style: "cancel" },
      ]
    );
  };

  const deletePicture = async (pictureId) => {
    if (!pictureId) return;
    try {
        const response = await fetch(`${Globals.API_BASE_URL}/api/Picture/${pictureId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error('Failed to delete old picture.');
        console.log(`Successfully deleted picture ID: ${pictureId}`);
    } catch (error) {
        // Silently fail or show a non-blocking warning, as this is part of a larger save operation.
        console.error(error.message);
    }
  };

  // --- NEW FUNCTION (from EditProfile) ---
  const uploadImage = async (imageUri, role, altText, uploaderId) => {
    if (!imageUri || !imageUri.startsWith("file://")) {
      return null;
    }
    const formData = new FormData();
    const fileType = imageUri.substring(imageUri.lastIndexOf(".") + 1);
    const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;
    formData.append("files", { uri: imageUri, name: `${role}.${fileType}`, type: mimeType });
    formData.append("picRoles", role);
    formData.append("picAlts", altText);
    formData.append("uploaderId", uploaderId);
    try {
      const uploadResponse = await fetch(`${Globals.API_BASE_URL}/api/Picture`, { method: "POST", body: formData });
      const uploadResults = await uploadResponse.json();
      if (!uploadResponse.ok || !Array.isArray(uploadResults) || uploadResults.length === 0 || !uploadResults[0].success) {
        const errorMsg = uploadResults?.[0]?.errorMessage || `Image upload failed (HTTP ${uploadResponse.status})`;
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
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
        text2: error.message,
        position: "top",
      });
      throw error;
    }
  };

  // --- NEW HELPER FUNCTION (from EditProfile) ---
  const processImage = async (currentPic, initialPic, clearedFlag, role, altText) => {
    const storedUserID = await AsyncStorage.getItem("userID");
    if (currentPic.PicPath?.startsWith("file://")) {
      if (initialPic?.PicID) await deletePicture(initialPic.PicID);
      return await uploadImage(currentPic.PicPath, role, currentPic.PicAlt || altText, storedUserID);
    }
    if (clearedFlag) {
      if (initialPic?.PicID) await deletePicture(initialPic.PicID);
      return null;
    }
    // If an image from history was selected, it will already have a server path
    if (currentPic.PicPath?.startsWith("/Images/")) {
      // If the selected history image is different from the initial one, delete the initial one
      if (initialPic?.PicID && initialPic.PicID !== currentPic.PicID) {
        await deletePicture(initialPic.PicID);
      }
      return currentPic;
    }
    return initialPic; // Return the initial picture if no changes were made
  };


  // --- CHANGE: handleSave is now much simpler and more robust ---
  const handleSave = async () => {
    const phoneError = validateField("mobilePhone", form.mobilePhone);
    const emailError = validateField("email", form.email);
    const newErrors = { mobilePhone: phoneError, email: emailError };
    setErrors(newErrors);

    if (phoneError || emailError) {
      Toast.show({ type: "error", text1: t("Common_ValidationErrorTitle"), text2: phoneError || emailError });
      return;
    }
    
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      const initialPicParsed = initialPic ? JSON.parse(initialPic) : null;
      
      const finalProfilePicData = await processImage(
        profilePic,
        initialPicParsed,
        clearedPic,
        "profile_picture",
        "Instructor Profile Picture"
      );

      const response = await fetch(`${Globals.API_BASE_URL}/api/People/UpdateInstructorProfile`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await AsyncStorage.getItem('jwt')}`
          },
          body: JSON.stringify({
              personId: storedUserID,
              phoneNumber: form.mobilePhone,
              email: form.email,
              profilePicId: finalProfilePicData?.PicID || null
          })
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update profile");
      }

      Toast.show({ type: "success", text1: t("EditProfileScreen_ProfileUpdated") });
      router.back();
    } catch (error) {
      Toast.show({ type: "error", text1: "Update Failed", text2: error.message });
    }
  };

  const isMaxFontSize = settings.fontSizeMultiplier === 3;
  const buttonContainerStyle = [ styles.buttonRow, isMaxFontSize && styles.buttonColumn ];
  const buttonStyle = [ styles.actionButton, isMaxFontSize && { width: '85%' } ];

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
          {errors.mobilePhone && (<StyledText style={styles.errorText}>{errors.mobilePhone}</StyledText>)}
          <FloatingLabelInput
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_email")}
            value={form.email}
            onChangeText={(text) => handleFormChange("email", text)}
            keyboardType="email-address"
            maxLength={100}
          />
          {errors.email && <StyledText style={styles.errorText}>{errors.email}</StyledText>}
        </View>

        <View style={buttonContainerStyle}>
          <FlipButton onPress={handleSave} bgColor="white" textColor="black" style={buttonStyle}>
            <StyledText style={styles.buttonText}>{t("EditProfileScreen_saveButton")}</StyledText>
          </FlipButton>
          <FlipButton onPress={() => router.back()} bgColor="white" textColor="black" style={buttonStyle}>
            <StyledText style={styles.buttonText}>{t("EditProfileScreen_cancelButton")}</StyledText>
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
        clearedPictureIds={clearedPic && initialPic ? [JSON.parse(initialPic)?.PicID] : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fef1e6" },
  scroll: { alignItems: "center", paddingBottom: 60, paddingTop: 80 },
  profileImageContainer: { alignItems: "center", marginVertical: 10 },
  profileImage: { width: 300, height: 300, borderRadius: 60, borderWidth: 2, borderColor: "#ddd" },
  profileNameContainer: { bottom: 60, alignItems: "center", borderRadius: 70, paddingVertical: 12, marginBottom: -40, width: "80%", backgroundColor: "#fff", borderColor: "#000000", borderWidth: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  profileName: { opacity: 0.9, padding: 10, fontWeight: "bold", fontSize: 22, paddingHorizontal: 16, paddingVertical: 8, width: "100%", textAlign: "center" },
  editableContainer: { width: "100%", alignItems: "center", marginTop: 30, gap: 30 },
  inputContainer: { width: "85%", alignSelf: "center" },
  buttonRow: { 
    flexDirection: "row", 
    justifyContent: "space-evenly", 
    marginTop: 40, 
    width: "100%" 
  },
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: { 
    paddingVertical: 12, 
    borderRadius: 8, 
    width: "40%", 
    alignItems: "center" 
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
});