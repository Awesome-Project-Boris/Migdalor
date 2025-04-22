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

  // !! Switch these with the values from the database
  const [form, setForm] = useState({
    name: "",
    partner: "",
    mobilePhone: "",
    email: "",
    origin: "",
    profession: "",
    interests: "",
    aboutMe: "",
    // profilePicID: "",
    // additionalPic1ID: "",
    // additionalPic2ID: "",
    residentApartmentNumber: null,
  });

  const [profilePic, setProfilePic] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
  });

  const [additionalPic1, setAdditionalPic1] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
  });

  const [additionalPic2, setAdditionalPic2] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
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
      //setProfilePic(null);
    }
    if (imageTypeToClear === "add1") {
      setClearedPics((prev) => ({ ...prev, add1: true }));
      setAdditionalPic1({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
      //setAdditionalPic1(null);
    }
    if (imageTypeToClear === "add2") {
      setClearedPics((prev) => ({ ...prev, add2: true }));
      setAdditionalPic2({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
      //setAdditionalPic2(null);
    }

    if (uriToDelete.startsWith("file://")) {
      await safeDeleteFile(uriToDelete);
    }

    setShowImageViewModal(false);
    //setImageToViewUri("");
    setImageToViewUri(null);
    setImageTypeToClear(null);
  };


  const handleAddImage = async () => {
    const uriToAdd = imageToViewUri;

    // if (imageTypeToClear === "main") {
    //   setClearedPics((prev) => ({ ...prev, profile: true }));
    //   setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    //   //setProfilePic(null);
    // }
    // if (imageTypeToClear === "add1") {
    //   setClearedPics((prev) => ({ ...prev, add1: true }));
    //   setAdditionalPic1({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    //   //setAdditionalPic1(null);
    // }
    // if (imageTypeToClear === "add2") {
    //   setClearedPics((prev) => ({ ...prev, add2: true }));
    //   setAdditionalPic2({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    //   //setAdditionalPic2(null);
    // }

    // if (uriToAdd.startsWith("file://")) {
    //   await safeDeleteFile(uriToAdd);
    // }

    // setShowImageViewModal(false);
    // //setImageToViewUri("");
    // setImageToViewUri(null);
    // setImageTypeToClear(null);

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
    setShowImageViewModal(false);
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
      return uploadResults[0].picId; // Return the new PicID
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

      //alert(t("EditProfileScreen_ProfileUpdateCancelled"));
      Toast.show({
        type: "info", // Type for styling (if themes are set up)
        text1: t("EditProfileScreen_ProfileUpdateCancelled"),
        //text1: 'Submitted!', // Main text
        //text2: t("EditProfileScreen_ProfileUpdated"), // Sub text
        duration: 3500, // Custom duration
        position: "top", // Example: 'top' or 'bottom'
      });

      //router.back({
      //router.replace({
      //   pathname: "./Profile",
      //   params: {
      //     updatedData: JSON.stringify(parsedInitialData),
      //     updatedPics: JSON.stringify({
      //       profilePic: parsedInitialPics.profilePic,
      //       additionalPic1: parsedInitialPics.additionalPic1,
      //       additionalPic2: parsedInitialPics.additionalPic2,
      //     }),
      //   },
      // });
      router.back();
    } catch (err) {
      console.warn("Failed to parse initialData during cancel:", err);
      // You can fallback to just navigating without data

      //router.replace("./Profile");
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

  const handleImagePress = (imageUriToView, altText = "") => {
    if (!imageUriToView) {
      console.log("handleImagePress: No valid imageUri provided.");
      return;
    }
    console.log("handleImagePress: imageUriToView:", imageUriToView);

    // if (imageUriToView === Globals.API_BASE_URL) {
    //   console.log("handleImagePress: No valid imageUri provided.");
    //   return;
    // }

    const paramsToPass = {
      imageUri: imageUriToView,
      altText: altText,
    };

    console.log("Navigating to ImageViewScreen with params:", paramsToPass);

    router.push({
      pathname: "/ImageViewScreen",
      params: paramsToPass,
    });
  };

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

  // const pickImage = async (type) => {
  //   //console.log("pickImage: type:", type); // Debugging line

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     quality: 0.8,
  //   });

  //   if (!result.canceled && result.assets.length > 0) {
  //     const localUri = result.assets[0].uri;
  //     if (type === "main") {
  //       setProfilePic({ ...profilePic, PicPath: localUri }); // local
  //     } else if (type === "add1") {
  //       setAdditionalPic1({ ...additionalPic1, PicPath: localUri });
  //     } else if (type === "add2") {
  //       setAdditionalPic2({ ...additionalPic2, PicPath: localUri });
  //     }
  //   }
  // };

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

                  //setImage(newUri);
                  console.log("New URI (library):", newUri);
                  //setProfilePic((prev) => ({ ...prev, PicPath: newUri }));
                  //setImage((prev) => ({ ...prev, PicPath: newUri }));
                  setImageToViewUri(newUri);
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
    //console.log("viewOrPickImage: currentUri:", currentUri);
    console.log(currentUri === Globals.API_BASE_URL);
    console.log("currentUri: ", currentUri);
    console.log(currentUri == "");
    //
    //if (currentUri === Globals.API_BASE_URL) {
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

      // pickImage(type === "main" ? setMainImage : setExtraImage);
      // pickImage(type === "add1" ? setMainImage : setExtraImage);
      // pickImage(type === "add2" ? setMainImage : setExtraImage);
      // switch (type) {
      //   case "main":
      //     pickImage("main", setProfilePic);
      //     break;
      //   case "add1":
      //     pickImage("add1", setAdditionalPic1);
      //     break;
      //   case "add2":
      //     pickImage("add2", setAdditionalPic2);
      //     break;
      //   default:
      //     console.error("Invalid image type:", type);
      // }
    }
  };

  const deletePicture = async (pictureId) => {
    if (!pictureId) return; // No ID to delete
    console.log(`Attempting to delete picture ID: ${pictureId} via API...`);
    try {
      // ** TODO: Implement Backend Call **
      // Requires: DELETE /api/Picture/{pictureId} endpoint
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Picture/${pictureId}`,
        {
          method: "DELETE",
          // Add Auth headers if needed
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
        // Blur first to make sure that even if the input is focused, it will auto scroll to it
        ref.current.blur();
        setTimeout(() => {
          ref.current?.focus();
        }, 10);
      }
      return;
    }

    setForm(cleanedForm);
    console.log("Updated Data:", cleanedForm);
    //alert(t("EditProfileScreen_ProfileUpdated"));
    Toast.show({
      type: "success", // Type for styling (if themes are set up)
      text1: t("EditProfileScreen_ProfileUpdated"),
      //text1: 'Submitted!', // Main text
      //text2: t("EditProfileScreen_ProfileUpdated"), // Sub text
      duration: 3500, // Custom duration
      position: "top", // Example: 'top' or 'bottom'
    });

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

      //console.log("user:", storedUserID);
      cleanedForm.residentApartmentNumber = parseInt(
        cleanedForm.residentApartmentNumber
      );
      form.residentApartmentNumber = parseInt(form.residentApartmentNumber);
      console.log(
        "cleanedForm.residentApartmentNumber ",
        cleanedForm.residentApartmentNumber
      );
      //console.log(typeof cleanedForm.residentApartmentNumber);
      //console.log(typeof form.residentApartmentNumber);
      console.log("form.residentApartmentNumber", form.residentApartmentNumber);

      // !! for testing, change later
      //form.residentApartmentNumber = parseInt(22222);
      //cleanedForm.residentApartmentNumber = parseInt(22222);

      console.log("cleanedform ", cleanedForm);

      const uploadAndWrap = async (imageObj, role, altText, uploaderId) => {
        const imageUri = imageObj.PicPath;
        if (!imageUri || !imageUri.startsWith("file://")) return null;

        const newPicId = await uploadImage(imageUri, role, altText, uploaderId);
        return {
          PicID: newPicId,
          PicName: "", // optional
          PicPath: imageUri,
          PicAlt: altText,
        };
      };

  

      let uploadedProfilePic;
      if (clearedPics.profile) {
        // “Remove” pressed
        uploadedProfilePic = null;
      } else if (
        typeof profilePic?.PicPath === "string" &&
        profilePic.PicPath.startsWith("file://")
      ) {
        // brand‑new local file → upload it
        uploadedProfilePic = await uploadAndWrap(
          profilePic,
          "profile_picture",
          "Profile picture",
          storedUserID
        );
      } else {
        // reuse existing if it has an ID, else clear
        uploadedProfilePic = profilePic?.PicID ? profilePic : null;
      }
      let uploadedAdd1Pic;
      if (removedAdd1Pic) {
        // You clicked “remove”
        uploadedAdd1Pic = null;
      } else if (
        typeof additionalPic1?.PicPath === "string" &&
        additionalPic1.PicPath.startsWith("file://")
      ) {
        // A brand‑new local file that needs uploading
        uploadedAdd1Pic = await uploadAndWrap(
          additionalPic1,
          "secondary_profile",
          "Extra picture 1",
          storedUserID
        );
      } else {
        // Everything else: either reuse the existing picture object,
        // or if there's genuinely nothing there, null it
        uploadedAdd1Pic = additionalPic1?.PicID ? additionalPic1 : null;
      }

      let uploadedAdd2Pic;
      if (removedAdd2Pic) {
        uploadedAdd2Pic = null;
      } else if (
        typeof additionalPic2?.PicPath === "string" &&
        additionalPic2.PicPath.startsWith("file://")
      ) {
        uploadedAdd2Pic = await uploadAndWrap(
          additionalPic2,
          "secondary_profile",
          "Extra picture 2",
          storedUserID
        );
      } else {
        uploadedAdd2Pic = additionalPic2?.PicID ? additionalPic2 : null;
      }

      const apiurl = `${Globals.API_BASE_URL}/api/People/UpdateProfile/${storedUserID}`; // !! check this is the  correct endpoint

      // const requestBody = {
      //   ...cleanedForm,
      //   profilePicture: profilePic,
      //   additionalPicture1: additionalPic1,
      //   additionalPicture2: additionalPic2,
      // };

      const requestBody = {
        // your cleaned form fields
        ...cleanedForm,
        // **must** match DTO names (in camelCase)
        profilePicture:    uploadedProfilePic,
        additionalPicture1: uploadedAdd1Pic,
        additionalPicture2: uploadedAdd2Pic,
      };


      // if (clearedPics.profile) {
      //   requestBody.profilePicture = null;
      // } else if (uploadedProfilePic?.PicID) {
      //   requestBody.profilePicture = uploadedProfilePic;
      // } else if (profilePic?.PicID) {
      //   requestBody.profilePicture = profilePic;
      // }

      // if (clearedPics.add1) {
      //   requestBody.additionalPicture1 = null;
      // } else if (uploadedAdd1Pic?.PicID) {
      //   requestBody.additionalPicture1 = uploadedAdd1Pic;
      // } else if (additionalPic1?.PicID) {
      //   requestBody.additionalPicture1 = additionalPic1;
      // }

      // if (clearedPics.add2) {
      //   requestBody.additionalPicture2 = null;
      // } else if (uploadedAdd2Pic?.PicID) {
      //   requestBody.additionalPicture2 = uploadedAdd2Pic;
      // } else if (additionalPic2?.PicID) {
      //   requestBody.additionalPicture2 = additionalPic2;
      // }

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

      // const requestBody = {
      //   ...cleanedForm,
      //   profilePicture: uploadedProfilePic,
      //   additionalPicture1: uploadedAdd1Pic,
      //   additionalPicture2: uploadedAdd2Pic,
      // };

      const response = await fetch(apiurl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ phoneNumber, password }),
        body: JSON.stringify(requestBody),
      });

      console.log("body:");
      console.log({
        ...cleanedForm,
        profilePic,
        additionalPic1,
        additionalPic2,
      });

      console.log("response:", response);

      if (!response.ok) {
        throw new Error(`Login failed: HTTP ${response.status}`);
      }

      //router.back({
      //router.replace({
      //   pathname: "./Profile",
      //   params: {
      //     //updatedData: JSON.stringify(form),
      //     updatedData: JSON.stringify(cleanedForm),
      //     updatedPics: JSON.stringify({
      //       profilePic,
      //       additionalPic1,
      //       additionalPic2,
      //     }),
      //   },
      // });
      router.back();
    } catch (error) {
      console.error("Error getting userID", error);
    }
  };

  //console.log("Form Data:", form);
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
            //   handleImagePress(
            //     Globals.API_BASE_URL + profilePic.PicPath,
            //     profilePic.PicAlt
            //   )
            // }
            //onPress={() => viewOrPickImage("main", imageUrl.uri)}
            // onPress={() =>
            //   viewOrPickImage("main", Globals.API_BASE_URL + profilePic.PicPath)
            // }

            onPress={() =>
              viewOrPickImage(
                "main",
                profilePic.PicPath?.trim()
                  ? Globals.API_BASE_URL + profilePic.PicPath
                  : "" // Triggers default
              )
            }
            //disabled={!(Globals.API_BASE_URL + profilePic.PicPath)}
            disabled={!profilePic.PicPath?.trim()}
          >
            {/* <Image
              alt={profilePic.PicAlt}
              //source={imageUrl}
              source={profileImage}
              style={styles.profileImage}
            /> */}
            {profilePic.PicPath === "" ? (
              <>
                <Image
                  alt={profilePic.PicAlt}
                  //source={imageUrl}
                  source={profileImage}
                  //source={imageUrl}
                  style={styles.profileImage}
                />
                <Card.Background>
                  {/* <ExpoImage
                    alt={profilePic.PicAlt}
                    source={defaultUserImage}
                    //source={imageUrl}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  /> */}
                </Card.Background>
                <YStack
                  f={1}
                  jc="center"
                  ai="center"
                  backgroundColor="rgba(0,0,0,0.4)"
                >
                  {/* <Paragraph theme="alt2">
                    {t("MarketplaceNewItemScreen_MainImage")}
                  </Paragraph> */}
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
                  //source={{ uri: profilePic.PicPath }}
                  //source={imageUrl}
                  source={profileImage}
                  //source={{ uri: imageUrl}}
                  style={styles.profileImage}
                />
                {/* <ExpoImage
                  alt={profilePic.PicAlt}
                  //source={defaultUserImage}
                  source={imageUrl}
                  //source={{ uri: profilePic.PicPath }}

                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                /> */}

                {/* <H2 size="$5">{t("MarketplaceNewItemScreen_MainImage")}</H2>
                <Paragraph theme="alt2">
                  {t("MarketplaceNewItemScreen_ImageOptional")}
                </Paragraph>
                <Paragraph theme="alt2">
                  {t("MarketplaceNewItemScreen_ImageTapToChoose")}
                </Paragraph> */}
              </YStack>
            )}
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          {/* !! Change this to full name  */}
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
            value={String(form.residentApartmentNumber)}
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
            //multiline
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
              //   handleImagePress(
              //     Globals.API_BASE_URL + additionalPic1.PicPath,
              //     additionalPic1.PicAlt
              //   )
              // }
              //onPress={() => viewOrPickImage("add1", additionalImage1.uri)}

              // onPress={() =>
              //   viewOrPickImage(
              //     "add1",
              //     Globals.API_BASE_URL + additionalPic1.PicPath
              //   )
              // }

              onPress={() =>
                viewOrPickImage(
                  "add1",
                  additionalPic1.PicPath?.trim()
                    ? Globals.API_BASE_URL + additionalPic1.PicPath
                    : "" // Triggers default
                )
              }
              //disabled={!(Globals.API_BASE_URL + additionalPic1.PicPath)}
              disabled={!additionalPic1.PicPath?.trim()}
            >
              <Image
                alt={additionalPic1.PicAlt}
                source={additionalImage1}
                //source={{ uri: additionalPic1.PicPath }}
                style={styles.profileImage}
              />
            </BouncyButton>

            <BouncyButton
              shrinkScale={0.95}
              // onPress={() =>
              //   handleImagePress(
              //     Globals.API_BASE_URL + additionalPic2.PicPath,
              //     additionalPic2.PicAlt
              //   )
              // }
              //onPress={() => viewOrPickImage("add2", additionalImage2.uri)}

              // onPress={() =>
              //   viewOrPickImage(
              //     "add2",
              //     Globals.API_BASE_URL + additionalPic2.PicPath
              //   )
              // }

              onPress={() =>
                viewOrPickImage(
                  "add2",
                  additionalPic2.PicPath?.trim()
                    ? Globals.API_BASE_URL + additionalPic2.PicPath
                    : "" // Triggers default
                )
              }
              //disabled={!(Globals.API_BASE_URL + additionalPic2.PicPath)}
              disabled={!additionalPic2.PicPath?.trim()}
            >
              <Image
                alt={additionalPic2.PicAlt}
                source={additionalImage2}
                //source={{ uri: additionalPic2.PicPath }}
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
        //imageUri={imageToViewUri}
        //imageUri={defaultUserImage}
        // imageUri= {
        //   typeof imageToViewUri === "string"
        //     ? imageToViewUri
        //     : defaultUserImage // likely a `require(...)` from defaultUserImage
        // }

        // imageUri= {
        //   imageToViewUri === ""
        //     ? defaultUserImage
        //     : imageToViewUri // likely a `require(...)` from defaultUserImage
        // }

        // source={
        //   imageToViewUri === ""
        //     ? defaultUserImage
        //     : { imageUri: imageToViewUri } // This handles require(...)
        // }

        // imageUri={
        //   imageToViewUri === null
        //     ? "../assets/images/defaultUser.png"
        //     : { uri: imageToViewUri } // This handles require(...)
        // }

        // imageUri={
        //   typeof imageToViewUri === "string" && imageToViewUri.trim() !== ""
        //     ? { uri: imageToViewUri }
        //     : require("../assets/images/defaultUser.png")
        // }

        //imageUri={"../assets/images/defaultUser.png"}

        imageUri={imageToViewUri}
        //imageUri={profilePic.Path === "" ? imageToViewUri : profilePic.Path}
        onClose={() => setShowImageViewModal(false)}

        onAdd={() => {
          //viewOrPickImage(imageTypeToClear, imageToViewUri); // your existing viewOrPickImage
          //pickImage(imageTypeToClear);        // your existing pickImage
          //setShowImageViewModal(false);

          handleAddImage(); // Clear the image after picking a new one
          //imageUri={imageToViewUri}
        }}


        //onRemove={wasDefaultImage ? undefined : handleRemoveImage}
        //onRemove={imageToViewUri === "" ? undefined : handleRemoveImage}

        //onRemove={imageToViewUri === "" ?  pickImage : handleRemoveImage}

        onRemove={handleRemoveImage}
        // onAddNew={
        //   wasDefaultImage
        //     ? () => {
        //         pickImage(imageTypeToClear);
        //         setShowImageViewModal(false);
        //       }
        //     : undefined
        // }
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
    // maxWidth: "90%", // 💡 prevent overflow
    // flexWrap: "wrap", // allow long names to wrap
    width: "100%",
    textAlign: "center",
  },
  inputContainer: {
    width: "85%",
    alignSelf: "center",
    marginVertical: 5,
  },
  // label: {
  //   fontSize: 14,
  //   marginBottom: 5,
  //   textAlign: "right",
  // },
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
    // marginLeft: 50,
    // marginRight: 50,
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
    //alignSelf: "center",
    width: "100%",
    marginTop: 30,
    gap: 30,
  },
  // extraImage: {
  //   width: 300,
  //   height: 300,
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   borderColor: "#ddd",
  //   marginHorizontal: 5,
  //   backgroundColor: "#fff",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 2,
  //   elevation: 3, // for Android shadow
  //   marginBottom: 30,
  // },

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
