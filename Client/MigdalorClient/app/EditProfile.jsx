import React, { useEffect, useState, useRef, forwardRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { Toast } from "toastify-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BouncyButton from "@/components/BouncyButton";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image"; // Use Expo Image

import ImageViewModal from "../components/ImageViewModal";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { Card, H2, Paragraph, XStack, YStack } from "tamagui";

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";
import LabeledTextInput from "@/components/LabeledTextInput";
import { Globals } from "@/app/constants/Globals";
const defaultUserImage = require("../assets/images/defaultUser.png");

export default function EditProfile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const { initialData, initialPics } = route.params;

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    partner: "",
    mobilePhone: "",
    email: "",
    origin: "",
    profession: "",
    interests: "",
    aboutMe: "",

    residentApartmentNumber: null,
  });

  const [profilePic, setProfilePic] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [additionalPic1, setAdditionalPic1] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [additionalPic2, setAdditionalPic2] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const maxLengths = {
    partner: 100,
    residentApartmentNumber: 10,
    mobilePhone: 20,
    email: 100,
    origin: 100,
    profession: 100,
    interests: 200,
    aboutMe: 300,
  };

  const [formErrors, setFormErrors] = useState({});

  const inputRefs = {
    partner: useRef(null),
    residentApartmentNumber: useRef(null),
    mobilePhone: useRef(null),
    email: useRef(null),
    origin: useRef(null),
    profession: useRef(null),
    interests: useRef(null),
    aboutMe: useRef(null),
  };

  const regexHebrewEnglish = /^[\u0590-\u05FFa-zA-Z\s\-'.(),:\/]+$/;
  const regexHebrewEnglishNumbers = /^[\u0590-\u05FFa-zA-Z0-9\s\-'.(),:\/]+$/;
  const [removedMainPic, setRemovedMainPic] = useState(false);
  const [removedAdd1Pic, setRemovedAdd1Pic] = useState(false);
  const [removedAdd2Pic, setRemovedAdd2Pic] = useState(false);
  const [clearedPics, setClearedPics] = useState({
    profile: false,
    add1: false,
    add2: false,
  });

  const handleFormChange = (name, value) => {
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    console.log('Updated "' + name + '" to: "' + value + '"');
    console.log("Updated Data:", form);
  };

  const validateField = (name, value) => {
    const max = maxLengths[name];
    if (max && value.length > max) {
      return `${name} must be at most ${max} characters.`;
    }

    switch (name) {
      case "partner":
        return value.trim() === "" || regexHebrewEnglish.test(value)
          ? null
          : t("EditProfileScreen_errorMessagePartner");

      case "residentApartmentNumber":
        return value.trim() === "" || /^[0-9]+$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageApartmentNumber");

      case "mobilePhone":
        return value.trim() === "" || /^0\d{9}$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageMobilePhone");

      case "email":
        return value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageEmail");

      case "origin":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageOrigin");

      case "profession":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageProfession");

      case "interests":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageInterests");

      case "aboutMe":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageAboutMe");

      default:
        return null;
    }
  };

  const handleRemoveImage = async () => {
    const uriToDelete = imageToViewUri;

    if (imageTypeToClear === "main") {
      setClearedPics((prev) => ({ ...prev, profile: true }));
      setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }
    if (imageTypeToClear === "add1") {
      setClearedPics((prev) => ({ ...prev, add1: true }));
      setAdditionalPic1({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }
    if (imageTypeToClear === "add2") {
      setClearedPics((prev) => ({ ...prev, add2: true }));
      setAdditionalPic2({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }

    if (uriToDelete.startsWith("file://")) {
      await safeDeleteFile(uriToDelete);
    }

    setShowImageViewModal(false);
    setImageToViewUri(null);
    setImageTypeToClear(null);
  };

  const handleAddImage = async () => {
    switch (imageTypeToClear) {
      case "main":
        pickImage("main", setProfilePic);
        break;
      case "add1":
        pickImage("add1", setAdditionalPic1);
        break;
      case "add2":
        pickImage("add2", setAdditionalPic2);
        break;
      default:
        console.error("Invalid image type:", type);
    }
    // setShowImageViewModal(false);
  };

  const uploadImage = async (imageUri, role, altText, uploaderId) => {
    if (!imageUri || !imageUri.startsWith("file://")) {
      console.log(
        `Skipping upload for non-local file or null URI: ${imageUri}`
      );
      return null; // Not a local file to upload
    }

    console.log(`Uploading image: ${role}`);
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

    console.log("imageUri:", imageUri); // Debugging line
    console.log("role:", role); // Debugging line
    console.log("fileType:", fileType); // Debugging line
    console.log("picAlts:", altText); // Debugging line
    console.log("uploaderId:", uploaderId); // Debugging line

    console.log("FormData:", formData); // Debugging line
    console.log("ProfilePic", imageUri); // Debugging line

    try {
      const uploadResponse = await fetch(
        `${Globals.API_BASE_URL}/api/Picture`,
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadResults = await uploadResponse.json(); // Assume server always returns JSON

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
      console.log(`Upload successful for ${role}:`, uploadResults[0]);
      await safeDeleteFile(imageUri); // Clean up local copy after successful upload
      return {
        PicID: uploadResults[0].picId,
        PicPath: uploadResults[0].serverPath, // This is the server path!
        PicName: uploadResults[0].originalFileName, // Keep original file name if useful
        PicAlt: altText, // Keep the alt text
      };
    } catch (error) {
      console.error(`Image upload failed for ${role}:`, error);
      Toast.show({
        type: "error",
        text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
        text2: error.message,
        position: "top",
      });
      // Decide if failure is critical. Maybe throw error to stop handleSubmit?
      throw error; // Re-throw to stop the submission process
    }
  };

  useEffect(() => {
    console.log("ClearedPics updated:", clearedPics);
  }, [clearedPics]);

  const handleCancel = () => {
    console.log("Cancelled Edit Profile");

    try {
      const parsedInitialData = JSON.parse(initialData);
      const parsedInitialPics = JSON.parse(initialPics);

      setForm(parsedInitialData);
      setProfilePic(parsedInitialPics.profilePic);
      setAdditionalPic1(parsedInitialPics.additionalPic1);
      setAdditionalPic2(parsedInitialPics.additionalPic2);

      Toast.show({
        type: "info", // Type for styling (if themes are set up)
        text1: t("EditProfileScreen_ProfileUpdateCancelled"),
        duration: 3500, // Custom duration
        position: "top", // Example: 'top' or 'bottom'
      });

      router.back();
    } catch (err) {
      console.warn("Failed to parse initialData during cancel:", err);
      router.back();
    }
  };

  useEffect(() => {
    // Update the form with initialData
    if (initialData) {
      const parsedData = JSON.parse(initialData);
      setForm(parsedData);
    }
    if (initialPics) {
      const pics = JSON.parse(initialPics);
      setProfilePic(pics.profilePic);
      setAdditionalPic1(pics.additionalPic1);
      setAdditionalPic2(pics.additionalPic2);
    }
  }, [initialData, initialPics]);

  const [profileImage, setProfileImage] = useState(defaultUserImage);
  const [additionalImage1, setAdditionalImage1] = useState(defaultUserImage);
  const [additionalImage2, setAdditionalImage2] = useState(defaultUserImage);

  useEffect(() => {
    if (profilePic.PicPath?.trim().startsWith("/Images/")) {
      setProfileImage({ uri: `${Globals.API_BASE_URL}${profilePic.PicPath}` });
    } else if (profilePic.PicPath?.startsWith("file://")) {
      setProfileImage({ uri: profilePic.PicPath });
    } else {
      setProfileImage(defaultUserImage);
    }
  }, [profilePic.PicPath]);

  useEffect(() => {
    if (additionalPic1.PicPath?.trim().startsWith("/Images/")) {
      setAdditionalImage1({
        uri: `${Globals.API_BASE_URL}${additionalPic1.PicPath}`,
      });
    } else if (additionalPic1.PicPath?.startsWith("file://")) {
      setAdditionalImage1({ uri: additionalPic1.PicPath });
    } else {
      setAdditionalImage1(defaultUserImage);
    }
  }, [additionalPic1.PicPath]);

  useEffect(() => {
    if (additionalPic2.PicPath?.trim().startsWith("/Images/")) {
      setAdditionalImage2({
        uri: `${Globals.API_BASE_URL}${additionalPic2.PicPath}`,
      });
    } else if (additionalPic2.PicPath?.startsWith("file://")) {
      setAdditionalImage2({ uri: additionalPic2.PicPath });
    } else {
      setAdditionalImage2(defaultUserImage);
    }
  }, [additionalPic2.PicPath]);


  // Helper function to get the current URI based on type
  // This function should return the *display-ready* URI (local or full server URL)
  const getDisplayUriForType = (type) => {
    switch (type) {
      case "main":
        // profileImage is already a { uri: ... } object or defaultUserImage
        return profileImage.uri || ""; // Return the URI string or empty
      case "add1":
        return additionalImage1.uri || "";
      case "add2":
        return additionalImage2.uri || "";
      default:
        return "";
    }
  };

  const handleImagePress = (type) => {
    setImageTypeToClear(type);
    const uriToDisplay = getDisplayUriForType(type); // Get the display-ready URI
    setImageToViewUri(uriToDisplay);
    setShowImageViewModal(true);
  };

  // Old logic
  // const handleImagePress = (imageUriToView, altText = "") => {
  //   if (!imageUriToView) {
  //     console.log("handleImagePress: No valid imageUri provided.");
  //     return;
  //   }
  //   console.log("handleImagePress: imageUriToView:", imageUriToView);

  //   // if (imageUriToView === Globals.API_BASE_URL) {
  //   //   console.log("handleImagePress: No valid imageUri provided.");
  //   //   return;
  //   // }

  //   const paramsToPass = {
  //     imageUri: imageUriToView,
  //     altText: altText,
  //   };

  //   console.log("Navigating to ImageViewScreen with params:", paramsToPass);

  //   router.push({
  //     pathname: "/ImageViewScreen",
  //     params: paramsToPass,
  //   });
  // };

  // Updating Pictures

  // --- Image Viewing/Removal Logic ---
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null); // 'main' | 'add1' | 'add2'

  const [wasDefaultImage, setWasDefaultImage] = useState(false);

  const copyImageToAppDir = async (sourceUri, prefix) => {
    try {
      const filename = `${prefix}-${Date.now()}-${sourceUri.split("/").pop()}`;
      const destinationUri = FileSystem.documentDirectory + filename;
      console.log(`Copying from ${sourceUri} to ${destinationUri}`);
      await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
      console.log(`Copy successful: ${destinationUri}`);
      return destinationUri;
    } catch (e) {
      console.error("FileSystem.copyAsync Error:", e);
      throw e;
    }
  };


  // --- Helper: Safely Delete Local File ---
  const safeDeleteFile = async (uri) => {
    if (!uri || !uri.startsWith("file://")) return;
    try {
      console.log(`Attempting to delete local file: ${uri}`);
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log(`Successfully deleted or file did not exist: ${uri}`);
    } catch (error) {
      console.error(`Error deleting local file ${uri}:`, error);
    }
  };

  // --- Image Picker ---

  const pickImage = async (type, setFn) => {
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.status !== "granted") {
      Alert.alert(
        t("ImagePicker_permissionDeniedTitle"),
        t("ImagePicker_libraryPermissionDeniedMessage"),
        [{ text: t("ImagePicker_cancelButton") }]
      );
      return;
    }

    Alert.alert(
      t("ImagePicker_selectSourceTitle"),
      t("ImagePicker_selectSourceMessage"),
      [
        {
          text: t("ImagePicker_takePhotoButton"),
          onPress: async () => {
            const cameraPermission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== "granted") {
              Alert.alert(
                t("ImagePicker_permissionDeniedTitle"),
                t("ImagePicker_cameraPermissionDeniedMessage"),
                [{ text: t("ImagePicker_cancelButton") }]
              );
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.5,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              console.log("Camera result:", result);
              console.log("Camera result.assets[0].uri:", result.assets[0].uri);
              try {
                const newUri = await copyImageToAppDir(
                  result.assets[0].uri,
                  "camera"
                );
                console.log("New URI (camera):", newUri);
                setFn((prev) => ({ ...prev, PicPath: newUri }));
                setImageToViewUri(newUri); // Set the URI to view the image
                //console.log("New URI after copy in camera:", newUri);
                //setImage(newUri);
              } catch (copyError) {
                Alert.alert(
                  t("ImagePicker_errorTitle"),
                  t("ImagePicker_saveCameraImageFailure"),
                  [{ text: t("ImagePicker_cancelButton") }]
                );
                setImage(null);
              }
            }
          },
        },
        {
          text: t("ImagePicker_chooseFromLibraryButton"),
          onPress: async () => {
            try {
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
              });
              if (!result.canceled && result.assets?.[0]?.uri) {
                try {
                  const newUri = await copyImageToAppDir(
                    result.assets[0].uri,
                    "library"
                  );
                  console.log("New URI (library):", newUri);
                  console.log("checking: ", newUri);
                  console.log("checking: ", profilePic.PicPath);

                  setFn((prev) => ({ ...prev, PicPath: newUri }));
                  setImageToViewUri(newUri);
                } catch (copyError) {
                  Alert.alert(
                    t("ImagePicker_errorTitle"),
                    t("ImagePicker_saveLibraryImageFailure"),
                    [{ text: t("ImagePicker_cancelButton") }]
                  );
                  setImage(null);
                }
              }
            } catch (error) {
              Alert.alert(
                t("ImagePicker_errorTitle"),
                t("ImagePicker_openLibraryFailure"),
                [{ text: t("ImagePicker_cancelButton") }]
              );
            }
          },
        },
        { text: t("ImagePicker_cancelButton"), style: "cancel" },
      ]
    );
    console.log("pickImage: type:", type); // Debugging line
    console.log("pickImage: profilePic:", profilePic); // Debugging line
  };

  const viewOrPickImage = (type, currentUri) => {
    console.log(currentUri === Globals.API_BASE_URL);
    console.log("currentUri: ", currentUri);
    console.log(currentUri == "");
    if (currentUri == "") {
      // When no image is set
      // Show add-new option instead of remove
      setWasDefaultImage(true);
      setImageToViewUri(""); // no image to show
      setImageTypeToClear(type);
      setShowImageViewModal(true);
    } else {
      setWasDefaultImage(false);
      setImageToViewUri(currentUri);
      setImageTypeToClear(type);
      setShowImageViewModal(true);
    }
  };

  const deletePicture = async (pictureId) => {
    if (!pictureId) return; // No ID to delete
    console.log(`Attempting to delete picture ID: ${pictureId} via API...`);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Picture/${pictureId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMsg = `Failed to delete picture ${pictureId} (HTTP ${response.status})`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      console.log(`Successfully deleted picture ID: ${pictureId} via API.`);
      // No need to delete local file here, as it's an existing server file
    } catch (err) {
      console.error(`Failed to delete picture ID ${pictureId}:`, err);
      // Log error, maybe show a non-blocking warning to user?
      Toast.show({
        type: "warning",
        text1: t("MarketplaceItemScreen_PicDeleteErrorTitle"),
        text2: err.message,
      });
      // Don't necessarily stop the whole edit process if old pic deletion fails
    }
  };

  console.log("profilePic: ", profilePic);
  console.log("additionalPic1: ", additionalPic1);
  console.log("additionalImage1: ", additionalImage1);
  console.log("additionalPic2: ", additionalPic2);

  const handleSave = async () => {
    const newErrors = {};
    let firstErrorField = null;

    const cleanedForm = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "arrivalYear") {
        return;
      }

      const str = value == null ? "" : String(value);
      const cleanedValue = str.trim(); // safe now
      cleanedForm[key] = cleanedValue;

      const error = validateField(key, cleanedValue);
      newErrors[key] = error;
      if (!firstErrorField && error) {
        firstErrorField = key;
      }
    });

    setFormErrors(newErrors);

    if (firstErrorField) {
      const ref = inputRefs[firstErrorField];
      if (ref?.current) {
        ref.current.blur();
        setTimeout(() => {
          ref.current?.focus();
        }, 10);
      }
      return;
    }

    setForm(cleanedForm);
    console.log("Updated Data:", cleanedForm);

    //console.log(cleanedForm.residentApartmentNumber)

    // !! Add API call to save the data here
    console.log("Saving data to API...");
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      console.log("Stored user ID:", storedUserID); // Debugging line
      if (!storedUserID) {
        console.error("No user ID found in AsyncStorage.");
        return;
      }
      cleanedForm.residentApartmentNumber = parseInt(
        cleanedForm.residentApartmentNumber
      );
      form.residentApartmentNumber = parseInt(form.residentApartmentNumber);
      console.log(
        "cleanedForm.residentApartmentNumber ",
        cleanedForm.residentApartmentNumber
      );
      console.log("form.residentApartmentNumber", form.residentApartmentNumber);

      // !! for testing, change later
      //form.residentApartmentNumber = parseInt(22222);
      //cleanedForm.residentApartmentNumber = parseInt(22222);

      console.log("cleanedform ", cleanedForm);

      const uploadAndWrap = async (imageObj, role, altText, uploaderId) => {
        const imageUri = imageObj.PicPath;
        // Only upload if it's a new local file (starts with file://)
        if (imageUri?.startsWith("file://")) {
          const uploadedPicData = await uploadImage(imageUri, role, altText, uploaderId);
          return uploadedPicData; // Returns { PicID, PicPath (serverPath), PicName, PicAlt }
        }
        // If it's an existing server path (not a local file), return the existing object
        if (imageObj.PicID && imageObj.PicPath?.trim().startsWith("/Images/")) {
          return imageObj;
        }
        // Otherwise, it's null or an invalid path, so return null
        return null;
      };

      // --- Image Processing Logic for each picture ---
      // This logic determines the FINAL state of each picture (null, or server data)
      // and handles deletions of old server images if replaced or removed.

      let finalProfilePicData = null;
      // Scenario 1: A new local image was picked (either replacing an old one or adding to an empty slot)
      if (profilePic.PicPath?.startsWith("file://")) {
          // If there was an old server image (before the current edit session), delete it
          if (initialPics.profilePic?.PicID) { // Use initialPics to check for original server image
              await deletePicture(initialPics.profilePic.PicID);
          }
          finalProfilePicData = await uploadAndWrap(profilePic, "profile_picture", "Profile picture", storedUserID);
      }
      // Scenario 2: Image was cleared (removed) AND no new local image was picked
      else if (clearedPics.profile) {
          // If there was an old server image, delete it
          if (initialPics.profilePic?.PicID) {
              await deletePicture(initialPics.profilePic.PicID);
          }
          finalProfilePicData = null; // Truly cleared
      }
      // Scenario 3: Image was an existing server image and was NOT cleared or replaced
      else if (profilePic.PicID && profilePic.PicPath?.trim().startsWith("/Images/")) {
          finalProfilePicData = profilePic; // Keep the existing server image data
      }
      // Else, it remains null (e.g., if it was always null or an invalid path)


      let finalAdd1PicData = null;
      if (additionalPic1.PicPath?.startsWith("file://")) {
          if (initialPics.additionalPic1?.PicID) {
              await deletePicture(initialPics.additionalPic1.PicID);
          }
          finalAdd1PicData = await uploadAndWrap(additionalPic1, "secondary_profile", "Extra picture 1", storedUserID);
      } else if (clearedPics.add1) {
          if (initialPics.additionalPic1?.PicID) {
              await deletePicture(initialPics.additionalPic1.PicID);
          }
          finalAdd1PicData = null;
      } else if (additionalPic1.PicID && additionalPic1.PicPath?.trim().startsWith("/Images/")) {
          finalAdd1PicData = additionalPic1;
      }


      let finalAdd2PicData = null;
      if (additionalPic2.PicPath?.startsWith("file://")) {
          if (initialPics.additionalPic2?.PicID) {
              await deletePicture(initialPics.additionalPic2.PicID);
          }
          finalAdd2PicData = await uploadAndWrap(additionalPic2, "secondary_profile", "Extra picture 2", storedUserID);
      } else if (clearedPics.add2) {
          if (initialPics.additionalPic2?.PicID) {
              await deletePicture(initialPics.additionalPic2.PicID);
          }
          finalAdd2PicData = null;
      } else if (additionalPic2.PicID && additionalPic2.PicPath?.trim().startsWith("/Images/")) {
          finalAdd2PicData = additionalPic2;
      }

      // --- CRITICAL: Update the component's state with the new server paths and IDs ---
      setProfilePic(finalProfilePicData || { PicID: null, PicName: "", PicPath: "", PicAlt: "" });
      setAdditionalPic1(finalAdd1PicData || { PicID: null, PicName: "", PicPath: "", PicAlt: "" });
      setAdditionalPic2(finalAdd2PicData || { PicID: null, PicName: "", PicPath: "", PicAlt: "" });
      setClearedPics({ profile: false, add1: false, add2: false }); // Reset cleared flags


      const apiurl = `${Globals.API_BASE_URL}/api/People/UpdateProfile/${storedUserID}`; 
      console.log("API URL:", apiurl); // Debugging line

      const requestBody = {
        // your cleaned form fields
        ...cleanedForm,
        profilePicture: finalProfilePicData,
        additionalPicture1: finalAdd1PicData,
        additionalPicture2: finalAdd2PicData,
      };
      console.log("requestBody: ", requestBody);

      console.log("requestBody.profilePicture: ", requestBody.profilePicture);
      console.log(
        "requestBody.additionalPicture1: ",
        requestBody.additionalPicture1
      );
      console.log(
        "requestBody.additionalPicture2: ",
        requestBody.additionalPicture2
      );

      const response = await fetch(apiurl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("body:");
      console.log({
        ...cleanedForm,
        profilePic, // Note: These profilePic, additionalPic1, additionalPic2 here will be the *updated* state
        additionalPic1,
        additionalPic2,
      });

      console.log("response:", response);

      if (!response.ok) {
      let errorData = {};
      try { errorData = await response.json(); } catch (e) { }
      throw new Error(errorData?.message || `Profile update failed: HTTP ${response.status}`);
    }

      Toast.show({
        type: "success",
        text1: t("EditProfileScreen_ProfileUpdated"),

        duration: 3500,
        position: "top",
      });
      router.back();
    } catch (error) {
      console.error("Error getting userID", error);
    }
  };
  console.log("profilePic", profilePic);
  console.log("additionalPic1", additionalPic1);
  console.log("additionalPic2", additionalPic2);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Header />
        <View style={styles.profileImageContainer}>
          <BouncyButton
            shrinkScale={0.95}

            // onPress={() =>
            //   viewOrPickImage(
            //     "main",
            //     profilePic.PicPath?.trim()
            //       ? Globals.API_BASE_URL + profilePic.PicPath
            //       : "" // Triggers default
            //   )
            // }

            onPress={() => handleImagePress("main")}
            disabled={!profilePic.PicPath?.trim()}
          >
            {profilePic.PicPath === "" ? (
              <>
                <Image
                  alt={profilePic.PicAlt}
                  //source={imageUrl}
                  //source={profileImage}
                  source={
                    profilePic.PicPath
                      ? { uri: profilePic.PicPath }
                      : defaultUserImage
                  }
                  //source={imageUrl}
                  style={styles.profileImage}
                />
                <Card.Background>
                </Card.Background>
                <YStack
                  f={1}
                  jc="center"
                  ai="center"
                  backgroundColor="rgba(0,0,0,0.4)"
                >
                </YStack>
              </>
            ) : (
              <YStack
                f={1}
                jc="center"
                ai="center"
                p="$2"
                style={{ direction: Globals.userSelectedDirection }}
              >
                <Image
                  alt={profilePic.PicAlt}
                  source={profileImage}
                  style={styles.profileImage}
                />
              </YStack>
            )}
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          <Text style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </Text>
        </View>

        <View style={styles.editableContainer}>
          <FloatingLabelInput
            maxLength={maxLengths.residentApartmentNumber}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_apartmentNumber")}
            value={form.residentApartmentNumber}
            onChangeText={(text) =>
              handleFormChange("residentApartmentNumber", text)
            }
            keyboardType="numeric"
            ref={inputRefs.residentApartmentNumber}
          />
          {formErrors.residentApartmentNumber && (
            <Text style={styles.errorText}>
              {formErrors.residentApartmentNumber}
            </Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.mobilePhone}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_mobilePhone")}
            value={form.mobilePhone}
            onChangeText={(text) => handleFormChange("mobilePhone", text)}
            keyboardType="phone-pad"
            ref={inputRefs.mobilePhone}
          />
          {formErrors.mobilePhone && (
            <Text style={styles.errorText}>{formErrors.mobilePhone}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.email}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_email")}
            value={form.email}
            onChangeText={(text) => handleFormChange("email", text)}
            keyboardType="email-address"
            ref={inputRefs.email}
          />
          {formErrors.email && (
            <Text style={styles.errorText}>{formErrors.email}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.origin}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_origin")}
            value={form.origin}
            onChangeText={(text) => handleFormChange("origin", text)}
            ref={inputRefs.origin}
          />
          {formErrors.origin && (
            <Text style={styles.errorText}>{formErrors.origin}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.profession}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_profession")}
            value={form.profession}
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            onChangeText={(text) => handleFormChange("profession", text)}
            ref={inputRefs.profession}
          />
          {formErrors.profession && (
            <Text style={styles.errorText}>{formErrors.profession}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.interests}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_interests")}
            value={form.interests}
            onChangeText={(text) => handleFormChange("interests", text)}
            ref={inputRefs.interests}
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            numberOfLines={4}
          />
          {formErrors.interests && (
            <Text style={styles.errorText}>{formErrors.interests}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.aboutMe}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_aboutMe")}
            value={form.aboutMe}
            onChangeText={(text) => handleFormChange("aboutMe", text)}
            ref={inputRefs.aboutMe}
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            numberOfLines={6}
            textAlignVertical="top"
          />
          {formErrors.aboutMe && (
            <Text style={styles.errorText}>{formErrors.aboutMe}</Text>
          )}

          <Text
            style={[
              styles.label,
              {
                textAlign:
                  Globals.userSelectedDirection === "rtl" ? "right" : "left",
              },
            ]}
          >
            {t("ProfileScreen_extraImages")}
          </Text>

          <View style={styles.profileExtraImageContainer}>
            <BouncyButton
              shrinkScale={0.95}
              // onPress={() =>
              //   viewOrPickImage(
              //     "add1",
              //     additionalPic1.PicPath?.trim()
              //       ? Globals.API_BASE_URL + additionalPic1.PicPath
              //       : "" // Triggers default
              //   )
              // }

              onPress={() => handleImagePress("add1")}
              disabled={!additionalPic1.PicPath?.trim()}
            >
              <Image
                alt={additionalPic1.PicAlt}
                // source={
                //   additionalPic1.PicPath
                //     ? { uri: additionalPic1.PicPath }
                //     : defaultUserImage // Or a placeholder for empty extra image
                // }
                source={additionalImage1}
                style={styles.profileImage}
              />
            </BouncyButton>
            <BouncyButton
              shrinkScale={0.95}
              // onPress={() =>
              //   viewOrPickImage(
              //     "add2",
              //     additionalPic2.PicPath?.trim()
              //       ? Globals.API_BASE_URL + additionalPic2.PicPath
              //       : "" // Triggers default
              //   )
              // }

              onPress={() => handleImagePress("add2")}
              disabled={!additionalPic2.PicPath?.trim()}
            >
              <Image
                alt={additionalPic2.PicAlt}
                // source={
                //   additionalPic2.PicPath
                //     ? { uri: additionalPic2.PicPath }
                //     : defaultUserImage // Or a placeholder for empty extra image
                // }
                source={additionalImage2}
                style={styles.profileImage}
              />
            </BouncyButton>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <FlipButton
            onPress={handleSave}
            bgColor="white"
            textColor="black"
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {t("EditProfileScreen_saveButton")}
            </Text>
          </FlipButton>


          <FlipButton
            onPress={handleCancel}
            bgColor="white"
            textColor="black"
            style={styles.cancelButton}
          >
            <Text style={styles.saveButtonText}>
              {t("EditProfileScreen_cancelButton")}
            </Text>
          </FlipButton>
        </View>
      </ScrollView>
      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageToViewUri}
        onClose={() => setShowImageViewModal(false)}
        onAdd={() => {
          handleAddImage(); // Clear the image after picking a new one
        }}
        onRemove={handleRemoveImage}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#fff0da",
  },
  scroll: {
    alignItems: "center",
    paddingBottom: 60,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
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
  inputContainer: {
    width: "85%",
    alignSelf: "center",
    marginVertical: 5,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 40,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  extraImages: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 40,
    gap: 20,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 20,
    width: "80%",
  },
  box: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 30,
  },
  extraImage: {
    width: 300,
    height: 300,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 40,
  },
  profileExtraImageContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "75%",
    marginTop: 20,
    gap: 30,
  },
  editableContainer: {
    pointerEvents: "box-none",
    alignItems: "center",
    width: "100%",
    marginTop: 30,
    gap: 30,
  },

  buttonLabel: { fontSize: 20, fontWeight: "bold" },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginTop: -30,
    fontSize: 28,
    width: "90%",
    textAlign: "center",
  },
});
