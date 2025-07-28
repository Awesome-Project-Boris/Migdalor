import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
  I18nManager,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import StyledText from "@/components/StyledText"; // Import StyledText

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
import InterestModal from "@/components/InterestSelectionModal";
import ImageHistory from "@/components/ImageHistory";
import PrivacySettingsModal from "@/components/PrivacySettingsModal";
import ApartmentSelector from "@/components/ApartmentSelector";

import { useSettings } from "@/context/SettingsContext.jsx";

const defaultUserImage = require("../assets/images/defaultUser.png");

const getApartmentNumberFromGuid = (guid) => {
  if (!guid || typeof guid !== "string") {
    return "";
  }
  // This logic handles both a full GUID and a pre-parsed number string.
  const parts = guid.toUpperCase().split("A");
  const numberPart = parts.pop();
  if (numberPart && !isNaN(parseInt(numberPart, 10))) {
    return String(parseInt(numberPart, 10));
  }
  return guid; // Fallback to the original value if parsing fails
};

export default function EditProfile() {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();

  // --- START: Added for Unsaved Changes Warning ---
  const [showConfirm, setShowConfirm] = useState(false);
  const initialDataRef = useRef(null);
  const initialPicsRef = useRef(null);
  const initialInterestsRef = useRef(null);
  const initialPrivacySettingsRef = useRef(null);
  // --- END: Added for Unsaved Changes Warning ---

  const isInitialLoad = useRef(true);

  const { initialData, initialPics } = route.params || {};

  console.log("THIS IS INITIAL DATA: ", initialData);

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

  // --- START: State for custom image picker modal ---
  const [isImagePickerModalVisible, setImagePickerModalVisible] =
    useState(false);
  const [imagePickerContext, setImagePickerContext] = useState({
    type: null,
    setFn: null,
  });
  // --- END: State for custom image picker modal ---

  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showPartner: true,
    showApartmentNumber: true,
    showMobilePhone: true,
    showEmail: true,
    showArrivalYear: true,
    showOrigin: true,
    showProfession: true,
    showInterests: true,
    showAboutMe: true,
    showProfilePicture: true,
    showAdditionalPictures: true,
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
    residentApartmentNumber: 50,
    mobilePhone: 10,
    email: 100,
    origin: 100,
    profession: 100,
    interests: 200,
    aboutMe: 300,
  };

  const [isInterestModalVisible, setInterestModalVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [historyRole, setHistoryRole] = useState("");
  const [historyTargetSlot, setHistoryTargetSlot] = useState(null);

  // --- START: Added for scroll indicator ---
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const bounceValue = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // This creates a looping bouncing animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
    bounceAnimation.start();
    return () => bounceAnimation.stop(); // Clean up the animation
  }, [bounceValue]);

  const handleScroll = (event) => {
    // When the user scrolls down more than 20 pixels
    if (event.nativeEvent.contentOffset.y > 20 && showScrollIndicator) {
      // Fade out the indicator and then remove it from the screen
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowScrollIndicator(false));
    }
  };
  // --- END: Added for scroll indicator ---

  const openHistoryModal = (role, target) => {
    setIsNavigatingBack(true);
    setHistoryRole(role);
    setHistoryTargetSlot(target);
    setHistoryModalVisible(true);
  };
  useEffect(() => {
    console.log("The profilePic state has now been updated to:", profilePic);
  }, [profilePic]);

  useEffect(() => {
    console.log(
      "3. The 'additionalPic1' state was updated to:",
      JSON.stringify(additionalPic1, null, 2)
    );
  }, [additionalPic1]);

  const handleSelectFromHistory = (selectedImage) => {
    console.log(
      "2. Received in EditProfile:",
      JSON.stringify(selectedImage, null, 2)
    );
    switch (historyTargetSlot) {
      case "main":
        setProfilePic(selectedImage);
        break;
      case "add1":
        setAdditionalPic1(selectedImage);
        break;
      case "add2":
        setAdditionalPic2(selectedImage);
        break;
      default:
        console.error("Unknown history target slot:", historyTargetSlot);
        Toast.show({ type: "error", text1: "Could not select image." });
        break;
    }
    setHistoryModalVisible(false);
    setIsNavigatingBack(false);
    setHistoryTargetSlot(null);
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      if (initialData) {
        const parsedData = JSON.parse(initialData);
        initialDataRef.current = parsedData;

        const dataToSet = { ...parsedData };

        if (dataToSet.residentInterests) {
          const interests = dataToSet.residentInterests;
          setUserInterests(interests);
          initialInterestsRef.current = interests;
        } else if (dataToSet.interests) {
          const interests = dataToSet.interests.map((name) => ({ name }));
          setUserInterests(interests);
          initialInterestsRef.current = interests;
        } else {
          setUserInterests([]);
          initialInterestsRef.current = [];
        }

        setForm((prevForm) => ({ ...prevForm, ...dataToSet }));
      }
      if (initialPics) {
        const pics = JSON.parse(initialPics);
        initialPicsRef.current = pics; // Store initial pics
        setProfilePic({
          PicId: pics.profilePic?.picId || null,
          PicName: pics.profilePic?.picName || "",
          PicPath: pics.profilePic?.picPath || "",
          PicAlt: pics.profilePic?.picAlt || "",
        });
        setAdditionalPic1({
          PicId: pics.additionalPic1?.picId || null,
          PicName: pics.additionalPic1?.picName || "",
          PicPath: pics.additionalPic1?.picPath || "",
          PicAlt: pics.additionalPic1?.picAlt || "",
        });
        setAdditionalPic2({
          PicId: pics.additionalPic2?.picId || null,
          PicName: pics.additionalPic2?.picName || "",
          PicPath: pics.additionalPic2?.picPath || "",
          PicAlt: pics.additionalPic2?.picAlt || "",
        });
      }
      const fetchAllInterestsFromDB = async () => {
        try {
          const response = await fetch(`${Globals.API_BASE_URL}/api/Interests`);
          const data = await response.json();
          setAllInterests(data ? data.map((name) => ({ name })) : []);
        } catch (err) {
          console.error("Failed to fetch all interests:", err);
        }
      };
      fetchAllInterestsFromDB();
      isInitialLoad.current = false;
    }
  }, [initialData, initialPics]);

  const { initialSelectedNames, initialNewInterests } = useMemo(() => {
    const allExistingNames = new Set(allInterests.map((i) => i.name));
    const selected = userInterests
      .filter((i) => allExistingNames.has(i.name))
      .map((i) => i.name);
    const newlyAdded = userInterests
      .filter((i) => !allExistingNames.has(i.name))
      .map((i) => i.name);
    return {
      initialSelectedNames: selected,
      initialNewInterests: newlyAdded,
    };
  }, [userInterests, allInterests]);

  const handleConfirmInterests = ({ selectedNames, newInterests }) => {
    const existingInterestObjects = selectedNames.map((name) => ({ name }));
    const newInterestObjects = newInterests.map((name) => ({ name }));
    setUserInterests([...existingInterestObjects, ...newInterestObjects]);
    setInterestModalVisible(false);
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
  };

  const validateField = (name, value) => {
    const max = maxLengths[name];
    if (max && value.length > max) {
      return `${name} must be at most ${max} characters.`;
    }
    const isRequired = (val) => {
      if (!val || val.trim() === "") {
        return t("Validation_FieldIsRequired", "This field is required.");
      }
      return null;
    };
    switch (name) {
      case "partner":
        return value.trim() === "" || regexHebrewEnglish.test(value)
          ? null
          : t("EditProfileScreen_errorMessagePartner");
      case "mobilePhone":
        const requiredError = isRequired(value);
        if (requiredError) return requiredError;
        return /^0\d{9}$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageMobilePhone");
      case "email":
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          return null;
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
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
    const type = imageTypeToClear;
    if (type === "main") {
      if (profilePic.PicID || profilePic.PicId) {
        setClearedPics((prev) => ({ ...prev, profile: true }));
      }
      setProfilePic({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }
    if (type === "add1") {
      if (additionalPic1.PicID || additionalPic1.PicId) {
        setClearedPics((prev) => ({ ...prev, add1: true }));
      }
      setAdditionalPic1({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }
    if (type === "add2") {
      if (additionalPic2.PicID || additionalPic2.PicId) {
        setClearedPics((prev) => ({ ...prev, add2: true }));
      }
      setAdditionalPic2({ PicID: null, PicName: "", PicPath: "", PicAlt: "" });
    }
    setShowImageViewModal(false);
  };

  const handleAddImage = async () => {
    setShowImageViewModal(false); // Close the view modal first
    const type = imageTypeToClear;
    let setFn;
    switch (type) {
      case "main":
        setFn = setProfilePic;
        break;
      case "add1":
        setFn = setAdditionalPic1;
        break;
      case "add2":
        setFn = setAdditionalPic2;
        break;
      default:
        console.error("Invalid image type:", imageTypeToClear);
        return;
    }
    pickImage(type, setFn);
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
    try {
      const uploadResponse = await fetch(
        `${Globals.API_BASE_URL}/api/Picture`,
        { method: "POST", body: formData }
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
    if (!initialForm) return false;

    // Compare simple text fields
    const fieldsToCompare = [
      "partner",
      "mobilePhone",
      "email",
      "origin",
      "profession",
      "aboutMe",
      "residentApartmentNumber",
    ];
    for (const key of fieldsToCompare) {
      const formValue = form[key] === null ? "" : String(form[key]).trim();
      const initialValue =
        initialForm[key] === null ? "" : String(initialForm[key]).trim();
      if (formValue !== initialValue) return true;
    }

    // Check if a new local image was selected
    if (
      profilePic.PicPath?.startsWith("file://") ||
      additionalPic1.PicPath?.startsWith("file://") ||
      additionalPic2.PicPath?.startsWith("file://")
    ) {
      return true;
    }

    // Check if an existing image was removed or replaced from history
    const initialPicsData = initialPicsRef.current || {};
    if (
      clearedPics.profile ||
      ((profilePic.PicId || profilePic.PicID) &&
        (profilePic.PicId || profilePic.PicID) !==
          (initialPicsData.profilePic?.picId ||
            initialPicsData.profilePic?.PicId))
    )
      return true;
    if (
      clearedPics.add1 ||
      ((additionalPic1.PicId || additionalPic1.PicID) &&
        (additionalPic1.PicId || additionalPic1.PicID) !==
          (initialPicsData.additionalPic1?.picId ||
            initialPicsData.additionalPic1?.PicId))
    )
      return true;
    if (
      clearedPics.add2 ||
      ((additionalPic2.PicId || additionalPic2.PicID) &&
        (additionalPic2.PicId || additionalPic2.PicID) !==
          (initialPicsData.additionalPic2?.picId ||
            initialPicsData.additionalPic2?.PicId))
    )
      return true;

    // Compare interests
    const initialInterestNames = (initialInterestsRef.current || [])
      .map((i) => i.name)
      .sort();
    const currentInterestNames = userInterests.map((i) => i.name).sort();
    if (
      JSON.stringify(initialInterestNames) !==
      JSON.stringify(currentInterestNames)
    )
      return true;

    // Compare privacy settings
    if (
      JSON.stringify(privacySettings) !==
      JSON.stringify(initialPrivacySettingsRef.current)
    )
      return true;

    return false;
  };
  // --- END: Unsaved Changes Warning Logic ---

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

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (!storedUserID) return;
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/People/PrivacySettings/${storedUserID}`
        );
        if (response.ok) {
          const data = await response.json();
          setPrivacySettings(data);
          initialPrivacySettingsRef.current = data; // Store initial privacy settings
        }
      } catch (error) {
        console.error("Failed to fetch privacy settings:", error);
      }
    };
    fetchPrivacySettings();
  }, []);

  const handleSavePrivacySettings = (newSettings) => {
    setPrivacySettings(newSettings);
  };

  const getDisplayUriForType = (type) => {
    switch (type) {
      case "main":
        return profileImage.uri || "";
      case "add1":
        return additionalImage1.uri || "";
      case "add2":
        return additionalImage2.uri || "";
      default:
        return "";
    }
  };

  const handleImagePress = (type) => {
    const uriToDisplay = getDisplayUriForType(type);
    const isDefault = !uriToDisplay || uriToDisplay.includes("defaultUser.png");

    if (isDefault) {
      // If it's a default image, go straight to picking a new one
      let setFn;
      switch (type) {
        case "main":
          setFn = setProfilePic;
          break;
        case "add1":
          setFn = setAdditionalPic1;
          break;
        case "add2":
          setFn = setAdditionalPic2;
          break;
        default:
          return;
      }
      pickImage(type, setFn);
    } else {
      // If an image exists, show the view/remove/change modal
      setImageTypeToClear(type);
      setImageToViewUri(uriToDisplay);
      setShowImageViewModal(true);
    }
  };

  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null);
  const [wasDefaultImage, setWasDefaultImage] = useState(false);

  const copyImageToAppDir = async (sourceUri, prefix) => {
    try {
      const filename = `${prefix}-${Date.now()}-${sourceUri.split("/").pop()}`;
      const destinationUri = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
      return destinationUri;
    } catch (e) {
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

  // --- START: Custom Image Picker Modal Logic ---
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
    setImagePickerContext({ type, setFn });
    setImagePickerModalVisible(true);
  };

  const handleTakePhoto = async () => {
    setImagePickerModalVisible(false);
    const { type, setFn } = imagePickerContext;

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
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
      try {
        const newUri = await copyImageToAppDir(result.assets[0].uri, "camera");
        let defaultAlt =
          type === "main"
            ? "Profile picture"
            : type === "add1"
            ? "Extra picture 1"
            : "Extra picture 2";
        setFn((prev) => ({
          ...prev,
          PicPath: newUri,
          PicAlt: defaultAlt,
        }));
        setImageToViewUri(newUri);
      } catch (copyError) {
        Alert.alert(
          t("ImagePicker_errorTitle"),
          t("ImagePicker_saveCameraImageFailure"),
          [{ text: t("ImagePicker_cancelButton") }]
        );
      }
    }
  };

  const handleChooseFromLibrary = async () => {
    setImagePickerModalVisible(false);
    const { type, setFn } = imagePickerContext;
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
          let defaultAlt =
            type === "main"
              ? "Profile picture"
              : type === "add1"
              ? "Extra picture 1"
              : "Extra picture 2";
          setFn((prev) => ({
            ...prev,
            PicPath: newUri,
            PicAlt: defaultAlt,
          }));
          setImageToViewUri(newUri);
        } catch (copyError) {
          Alert.alert(
            t("ImagePicker_errorTitle"),
            t("ImagePicker_saveLibraryImageFailure"),
            [{ text: t("ImagePicker_cancelButton") }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        t("ImagePicker_errorTitle"),
        t("ImagePicker_openLibraryFailure"),
        [{ text: t("ImagePicker_cancelButton") }]
      );
    }
  };

  const handleChooseFromHistory = () => {
    setImagePickerModalVisible(false);
    const { type } = imagePickerContext;
    const role = type === "main" ? "Profile picture" : "Extra picture";
    openHistoryModal(role, type);
  };
  // --- END: Custom Image Picker Modal Logic ---

  const deletePicture = async (pictureId) => {
    if (!pictureId) return;
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Picture/${pictureId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        let errorMsg = `Failed to delete picture ${pictureId} (HTTP ${response.status})`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
    } catch (err) {}
  };

  const handleSave = async () => {
    const newErrors = {};
    let firstErrorField = null;
    const cleanedForm = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "arrivalYear") return;
      const str = value == null ? "" : String(value);
      const cleanedValue = str.trim();
      cleanedForm[key] = cleanedValue;
      const error = validateField(key, cleanedValue);
      newErrors[key] = error;
      if (!firstErrorField && error) firstErrorField = key;
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

    setIsLoading(true);
    setForm(cleanedForm);
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      if (!storedUserID) {
        setIsLoading(false);
        return;
      }

      let apartmentGuid = null;
      const apartmentNum = parseInt(cleanedForm.residentApartmentNumber);

      if (!isNaN(apartmentNum) && apartmentNum > 0) {
        const apartmentResponse = await fetch(
          `${Globals.API_BASE_URL}/api/apartments/find-or-create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apartmentNumber: apartmentNum }),
          }
        );

        if (!apartmentResponse.ok) {
          const errorData = await apartmentResponse.json();
          Toast.show({
            type: "error",
            text1: t(
              "EditProfileScreen_ApartmentErrorTitle",
              "Apartment Error"
            ),
            text2:
              errorData.message ||
              t(
                "EditProfileScreen_InvalidApartmentNumber",
                "Invalid apartment number."
              ),
          });
          return;
        }

        const apartmentData = await apartmentResponse.json();
        apartmentGuid = apartmentData.apartmentNumber;
      }

      const allExistingNames = new Set(allInterests.map((i) => i.name));
      const finalSelectedNames = userInterests
        .filter((i) => allExistingNames.has(i.name))
        .map((i) => i.name);
      const finalNewInterestNames = userInterests
        .filter((i) => !allExistingNames.has(i.name))
        .map((i) => i.name);

      const initialPicsParsed = JSON.parse(initialPics);
      const processImage = async (
        currentPic,
        initialPic,
        clearedFlag,
        role,
        altText
      ) => {
        if (currentPic.PicPath?.startsWith("file://")) {
          if (initialPic?.picId) await deletePicture(initialPic.picId, role);
          return await uploadImage(
            currentPic.PicPath,
            role,
            currentPic.PicAlt || altText,
            storedUserID
          );
        }
        if (currentPic.PicPath?.startsWith("/Images/")) {
          if (
            initialPic?.picId &&
            initialPic.picId !== (currentPic.PicID || currentPic.PicId)
          )
            await deletePicture(initialPic.picId, role);
          return currentPic;
        }
        if (clearedFlag) {
          if (initialPic?.picId) await deletePicture(initialPic.picId, role);
          return null;
        }
        return null;
      };

      const finalProfilePicData = await processImage(
        profilePic,
        initialPicsParsed.profilePic,
        clearedPics.profile,
        "profile_picture",
        "Profile picture"
      );
      const finalAdd1PicData = await processImage(
        additionalPic1,
        initialPicsParsed.additionalPic1,
        clearedPics.add1,
        "secondary_profile",
        "Extra picture 1"
      );
      const finalAdd2PicData = await processImage(
        additionalPic2,
        initialPicsParsed.additionalPic2,
        clearedPics.add2,
        "secondary_profile",
        "Extra picture 2"
      );

      setProfilePic(
        finalProfilePicData || {
          PicID: null,
          PicName: "",
          PicPath: "",
          PicAlt: "",
        }
      );
      setAdditionalPic1(
        finalAdd1PicData || {
          PicID: null,
          PicName: "",
          PicPath: "",
          PicAlt: "",
        }
      );
      setAdditionalPic2(
        finalAdd2PicData || {
          PicID: null,
          PicName: "",
          PicPath: "",
          PicAlt: "",
        }
      );
      setClearedPics({ profile: false, add1: false, add2: false });

      const apiurl = `${Globals.API_BASE_URL}/api/People/UpdateProfile/${storedUserID}`;
      const requestBody = {
        name: cleanedForm.name,
        partner: cleanedForm.partner,
        mobilePhone: cleanedForm.mobilePhone,
        email: cleanedForm.email,
        origin: cleanedForm.origin,
        profession: cleanedForm.profession,
        aboutMe: cleanedForm.aboutMe,
        ResidentApartmentNumber: apartmentGuid,
        PersonId: storedUserID,
        profilePicture: finalProfilePicData,
        additionalPicture1: finalAdd1PicData,
        additionalPicture2: finalAdd2PicData,
        interestNames: finalSelectedNames,
        newInterestNames: finalNewInterestNames,
        privacySettings: privacySettings,
      };

      console.log("THIS IS THE OUTGOING FORM: ", cleanedForm);

      const response = await fetch(apiurl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {}
        throw new Error(
          errorData?.message || `Profile update failed: HTTP ${response.status}`
        );
      }
      Toast.show({
        type: "success",
        text1: t("EditProfileScreen_ProfileUpdated"),
        duration: 3500,
        position: "top",
      });
      router.back();
    } catch (error) {
      console.error("Error during save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const picturesInUse = [
    profilePic.PicID || profilePic.PicId,
    additionalPic1.PicID || additionalPic1.PicId,
    additionalPic2.PicID || additionalPic2.PicId,
  ].filter(Boolean);

  const initialPicsParsed = initialPics ? JSON.parse(initialPics) : {};
  const clearedPictureIds = [];
  if (clearedPics.profile && initialPicsParsed.profilePic)
    clearedPictureIds.push(initialPicsParsed.profilePic.picId);
  if (clearedPics.add1 && initialPicsParsed.additionalPic1)
    clearedPictureIds.push(initialPicsParsed.additionalPic1.picId);
  if (clearedPics.add2 && initialPicsParsed.additionalPic2)
    clearedPictureIds.push(initialPicsParsed.additionalPic2.picId);

  const isMaxFontSize = settings.fontSizeMultiplier === 3;

  const buttonContainerStyle = [
    styles.buttonRow,
    isMaxFontSize && styles.buttonColumn,
  ];

  const buttonStyle = [styles.actionButton, isMaxFontSize && { width: "85%" }];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Header />
        <View style={styles.profileImageContainer}>
          <BouncyButton
            shrinkScale={0.95}
            onPress={() => handleImagePress("main")}
          >
            {profilePic.PicPath === "" ? (
              <Image
                source={defaultUserImage}
                style={styles.profileImage}
                alt={t("EditProfileScreen_addProfilePicture")}
              />
            ) : (
              <Image
                alt={profilePic.PicAlt}
                source={profileImage}
                style={styles.profileImage}
              />
            )}
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          <StyledText style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </StyledText>
        </View>

        <View style={styles.editableContainer}>
          <ApartmentSelector
            value={form.residentApartmentNumber}
            onApartmentChange={(text) =>
              handleFormChange("residentApartmentNumber", text)
            }
            error={formErrors.residentApartmentNumber}
          />

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
            <StyledText style={styles.errorText}>
              {formErrors.mobilePhone}
            </StyledText>
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
            <StyledText style={styles.errorText}>{formErrors.email}</StyledText>
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
            <StyledText style={styles.errorText}>
              {formErrors.origin}
            </StyledText>
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
            <StyledText style={styles.errorText}>
              {formErrors.profession}
            </StyledText>
          )}

          <View style={styles.interestSectionContainer}>
            <StyledText style={styles.label}>
              {t("ProfileScreen_interests")}
            </StyledText>
            <View
              style={[
                styles.interestChipDisplay,
                {
                  flexDirection:
                    Globals.userSelectedDirection === "rtl"
                      ? "row-reverse"
                      : "row",
                },
              ]}
            >
              {userInterests.length > 0 ? (
                userInterests.map((interest) => (
                  <View
                    key={interest.interestID || interest.name}
                    style={styles.chipReadOnly}
                  >
                    <StyledText style={styles.chipTextReadOnly}>
                      {interest.name}
                    </StyledText>
                  </View>
                ))
              ) : (
                <StyledText
                  style={[
                    styles.noInterestsText,
                    {
                      width: "100%",
                      textAlign:
                        Globals.userSelectedDirection === "rtl"
                          ? "right"
                          : "left",
                    },
                  ]}
                >
                  {t("EditProfileScreen_noInterests")}
                </StyledText>
              )}
            </View>
            <FlipButton
              onPress={() => setInterestModalVisible(true)}
              style={styles.editInterestsButton}
            >
              <StyledText style={styles.editInterestsButtonText}>
                {t("EditProfileScreen_editInterestsButton")}
              </StyledText>
            </FlipButton>
          </View>

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
            <StyledText style={styles.errorText}>
              {formErrors.aboutMe}
            </StyledText>
          )}

          <StyledText
            style={[
              styles.label,
              {
                textAlign:
                  Globals.userSelectedDirection === "rtl" ? "right" : "left",
              },
            ]}
          >
            {t("ProfileScreen_extraImages")}
          </StyledText>

          <View style={styles.profileExtraImageContainer}>
            <BouncyButton
              shrinkScale={0.95}
              onPress={() => handleImagePress("add1")}
            >
              <Image
                alt={additionalPic1.PicAlt}
                source={additionalImage1}
                style={styles.profileImage}
              />
            </BouncyButton>
            <BouncyButton
              shrinkScale={0.95}
              onPress={() => handleImagePress("add2")}
            >
              <Image
                alt={additionalPic2.PicAlt}
                source={additionalImage2}
                style={styles.profileImage}
              />
            </BouncyButton>
          </View>
        </View>

        <FlipButton
          onPress={() => setPrivacyModalVisible(true)}
          style={styles.privacyButton}
        >
          <StyledText style={styles.privacyButtonText}>
            {t("PrivacySettings_title")}
          </StyledText>
        </FlipButton>

        <View style={buttonContainerStyle}>
          <FlipButton
            onPress={handleSave}
            bgColor="white"
            textColor="black"
            style={[buttonStyle, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <StyledText style={styles.actionButtonText}>
                {t("EditProfileScreen_saveButton")}
              </StyledText>
            )}
          </FlipButton>

          <FlipButton
            onPress={handleCancel}
            bgColor="white"
            textColor="black"
            style={buttonStyle}
          >
            <StyledText style={styles.actionButtonText}>
              {t("EditProfileScreen_cancelButton")}
            </StyledText>
          </FlipButton>
        </View>
      </ScrollView>

      {showScrollIndicator && (
        <Animated.View
          style={[
            styles.scrollIndicator,
            {
              opacity: indicatorOpacity,
              transform: [{ translateY: bounceValue }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="chevron-down" size={40} color="#FFFFFF" />
        </Animated.View>
      )}

      <ImageHistory
        visible={isHistoryModalVisible}
        picRole={historyRole}
        onClose={() => setHistoryModalVisible(false)}
        onSelect={handleSelectFromHistory}
        picturesInUse={picturesInUse}
        clearedPictureIds={clearedPictureIds}
      />
      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageToViewUri}
        onClose={() => setShowImageViewModal(false)}
        onAdd={handleAddImage}
        onRemove={handleRemoveImage}
      />
      <InterestModal
        visible={isInterestModalVisible}
        mode="edit"
        allInterests={allInterests}
        initialSelectedNames={initialSelectedNames}
        initialNewInterests={initialNewInterests}
        onClose={() => setInterestModalVisible(false)}
        onConfirm={handleConfirmInterests}
      />
      <PrivacySettingsModal
        visible={isPrivacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        initialSettings={privacySettings}
        onSave={handleSavePrivacySettings}
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
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  scroll: {
    alignItems: "center",
    paddingBottom: 60,
    paddingTop: 80,
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
    marginTop: 30,
    marginBottom: 30,
  },
  extraImages: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
  },
  buttonRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 40,
    gap: 30,
  },
  buttonColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "45%", // Default width for side-by-side
    alignItems: "center",
  },
  actionButtonText: {
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
    gap: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginTop: -30,
    fontSize: 28,
    width: "90%",
    textAlign: "center",
  },
  interestSectionContainer: {
    width: "85%",
    alignSelf: "center",
    marginBottom: 10,
  },
  interestChipDisplay: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  chipReadOnly: {
    backgroundColor: "#e0e0e0",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  chipTextReadOnly: {
    color: "#333",
    fontSize: 24,
  },
  noInterestsText: {
    color: "#999",
    fontStyle: "italic",
  },
  editInterestsButton: {
    marginTop: 35,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#347af0",
    marginBottom: 30,
  },
  editInterestsButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  privacyButton: {
    marginTop: 40,
    marginBottom: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#6c757d",
  },
  privacyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    zIndex: 10,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
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
  profileImageWrapper: {
    width: 300,
    height: 300,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  profileImageOverlayText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc", // A gray color to indicate it's disabled
    opacity: 0.7,
  },
});
