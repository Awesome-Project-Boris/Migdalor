import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";

import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import BouncyButton from "@/components/BouncyButton";
import { Globals } from "@/app/constants/Globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import ImageViewModal from "../components/ImageViewModal";
import ImageHistory from "@/components/ImageHistory";

const defaultUserImage = require("../assets/images/defaultUser.png");

export default function InstructorEditProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { initialData, initialPic } = useLocalSearchParams();

  const [form, setForm] = useState({
    name: "",
    mobilePhone: "",
    email: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profileImage, setProfileImage] = useState(defaultUserImage);
  const [errors, setErrors] = useState({});

  // State for image modals
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
      setProfilePic(pic);
    }
  }, [initialData, initialPic]);

  useEffect(() => {
    if (profilePic?.picPath?.startsWith("file://")) {
      setProfileImage({ uri: profilePic.picPath });
    } else if (profilePic?.picPath) {
      setProfileImage({ uri: `${Globals.API_BASE_URL}${profilePic.picPath}` });
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
      // 1. Check if the field is empty
      const requiredError = isRequired(value);
      if (requiredError) return requiredError;

      // 2. Then, check the phone number format
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(value)) {
        return t(
          "EditProfileScreen_errorMessageMobilePhone",
          "Please enter a valid 10-digit mobile number."
        );
      }
    }

    if (name === "email") {
      const trimmedValue = value.trim(); 
      const requiredError = isRequired(trimmedValue);
      if (requiredError) return requiredError;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Test the trimmed value
      if (!emailRegex.test(trimmedValue)) {
          return t(
              "EditProfileScreen_errorMessageEmail",
              "Please enter a valid email address."
          );
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
    setImageToViewUri(profileImage.uri || null);
    if (!profilePic?.picPath) {
      // If no picture exists, go directly to the add image flow.
      handleAddImage();
    } else {
      // If a picture exists, open the modal to view it.
      setImageToViewUri(profileImage.uri || null);
      setShowImageViewModal(true);
    }
  };

  const handleRemoveImage = () => {
    if (profilePic?.picId) {
        setClearedPic(true);
    }
    setProfilePic(null);
    setShowImageViewModal(false);
  };

  const handleSelectFromHistory = (selectedImage) => {
    setProfilePic({
        picId: selectedImage.PicID,
        picPath: selectedImage.PicPath,
        picAlt: selectedImage.PicAlt,
    });
    setHistoryModalVisible(false);
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

  const pickImage = async (source) => {
    setShowImageViewModal(false); // Close the view modal first
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
            setProfilePic({ picPath: newUri, picAlt: "Instructor Profile Picture" });
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

  const deletePictureOnServer = async (pictureId) => {
    if (!pictureId) return;
    try {
        const response = await fetch(`${Globals.API_BASE_URL}/api/Picture/${pictureId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error('Failed to delete old picture from server.');
        console.log(`Successfully deleted picture ID: ${pictureId}`);
    } catch (error) {
        console.error(error.message);
        Toast.show({ type: 'warning', text1: 'Could not delete old picture.' });
    }
  };


  const handleSave = async () => {
    const phoneError = validateField("mobilePhone", form.mobilePhone);
    const emailError = validateField("email", form.email);

    const newErrors = { mobilePhone: phoneError, email: emailError };
    setErrors(newErrors);

    if (phoneError || emailError) {
      Toast.show({
        type: "error",
        text1: t("Common_ValidationErrorTitle", "Validation Error"),
        text2: phoneError || emailError,
      });
      return; // Stop the function if there are errors
    }


    let finalProfilePicData = profilePic;
    const initialPicParsed = initialPic ? JSON.parse(initialPic) : null;

    // Case 1: A new local image was selected for upload
    if (profilePic?.picPath && profilePic.picPath.startsWith("file://")) {
        try {
            // Delete the old picture if it existed
            if (initialPicParsed?.picId) {
                await deletePictureOnServer(initialPicParsed.picId);
            }

            const storedUserID = await AsyncStorage.getItem("userID");
            const formData = new FormData();
            const uri = profilePic.picPath;
            const fileType = uri.substring(uri.lastIndexOf(".") + 1);
            const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

            formData.append("files", { uri, name: `profile-instructor.${fileType}`, type: mimeType });
            formData.append("picRoles", "profile_picture");
            formData.append("picAlts", "Instructor Profile Picture");
            formData.append("uploaderId", storedUserID);

            const uploadResponse = await fetch(`${Globals.API_BASE_URL}/api/Picture`, {
                method: "POST",
                body: formData,
            });

            const uploadResults = await uploadResponse.json();
            if (!uploadResponse.ok || !uploadResults[0]?.success) {
                throw new Error(uploadResults[0]?.errorMessage || "Image upload failed");
            }
            finalProfilePicData = {
                picId: uploadResults[0].picId,
            };
        } catch (error) {
            Toast.show({ type: "error", text1: "Image Upload Failed", text2: error.message });
            return;
        }
    } else if (clearedPic && initialPicParsed?.picId) {
        // Case 2: The image was explicitly removed
        await deletePictureOnServer(initialPicParsed.picId);
        finalProfilePicData = null;
    } else if (profilePic?.picId && initialPicParsed?.picId !== profilePic.picId) {
        // Case 3: A different image was selected from history
        await deletePictureOnServer(initialPicParsed.picId);
    }


    try {
        const storedUserID = await AsyncStorage.getItem("userID");
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
                profilePicId: finalProfilePicData?.picId || null
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
          <Text style={styles.profileName}>{form.name}</Text>
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
            <Text style={styles.errorText}>{errors.mobilePhone}</Text>
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
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.buttonRow}>
          <FlipButton onPress={handleSave} bgColor="white" textColor="black" style={styles.saveButton}>
            <Text style={styles.buttonText}>{t("EditProfileScreen_saveButton")}</Text>
          </FlipButton>
          <FlipButton onPress={() => router.back()} bgColor="white" textColor="black" style={styles.cancelButton}>
            <Text style={styles.buttonText}>{t("EditProfileScreen_cancelButton")}</Text>
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
        picturesInUse={[profilePic?.picId].filter(Boolean)}
        clearedPictureIds={clearedPic && initialPic ? [JSON.parse(initialPic).picId] : []}
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
  buttonRow: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 40, width: "100%" },
  saveButton: { paddingVertical: 12, borderRadius: 8, width: "40%", alignItems: "center" },
  cancelButton: { paddingVertical: 12, borderRadius: 8, width: "40%", alignItems: "center" },
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
