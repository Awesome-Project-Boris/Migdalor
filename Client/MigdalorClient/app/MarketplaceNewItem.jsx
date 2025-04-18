import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator, // Added ActivityIndicator
} from "react-native";
import { Image as ExpoImage } from "expo-image"; // Use Expo Image
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import FlipButton from "../components/FlipButton";
import ImageViewModal from "../components/ImageViewModal";
import FloatingLabelInput from "../components/FloatingLabelInput";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import { Keyboard } from 'react-native';


import { Card, H2, Paragraph, XStack, YStack, Spinner } from "tamagui";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AddNewItem() {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const API = Globals.API_BASE_URL;

  const itemNameRef = useRef(null);
  const itemDescriptionRef = useRef(null);

  // State for Local Image URIs
  const [mainImage, setMainImage] = useState(null); // Stores LOCAL URI after picking/copying
  const [extraImage, setExtraImage] = useState(null); // Stores LOCAL URI after picking/copying

  const router = useRouter();

  const ITEM_NAME_LIMIT = 100;
  const DESCRIPTION_LIMIT = 300;
  const ESCAPED_DESCRIPTION_LIMIT = 400;

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

  function estimateEscapedLength(str) {
    if (!str) return 0;
    let estimatedLength = str.length;
    estimatedLength += (str.match(/'/g) || []).length;
    return estimatedLength;
  }

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
  const pickImage = async (setImage) => {
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
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.5,
            });
            if (!result.canceled && result.assets) {
              try {
                const newUri = await copyImageToAppDir(
                  result.assets[0].uri,
                  "camera"
                );
                setImage(newUri);
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
              if (!result.canceled && result.assets) {
                try {
                  const newUri = await copyImageToAppDir(
                    result.assets[0].uri,
                    "library"
                  );
                  setImage(newUri);
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
  };

  const validateField = (name, value) => {
    const trimmedValue = value; // Don't trim here
    switch (name) {
      case "itemName":
        if (!trimmedValue.trim()) {
          // Trim only for the required check
          return t("MarketplaceNewItemScreen_errorTitleRequired");
        }
        if (value.length >= ITEM_NAME_LIMIT) {
          // Check raw length >= limit
          return t("MarketplaceNewItemScreen_errorTitleTooLong", {
            count: ITEM_NAME_LIMIT,
          });
        }
        return null; // No error

      case "itemDescription":
        // First, check raw length against visual/DB limit
        if (value.length >= DESCRIPTION_LIMIT) {
          // Check raw length >= limit
          return t("MarketplaceNewItemScreen_errorDescriptionTooLong", {
            count: DESCRIPTION_LIMIT,
          });
        }
        // If raw length is okay, check estimated escaped length
        const estimatedLength = estimateEscapedLength(value);
        if (estimatedLength >= ESCAPED_DESCRIPTION_LIMIT) {
          // Check estimated >= 400
          return t(
            "MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars",
            {
              count: ESCAPED_DESCRIPTION_LIMIT,
            }
          );
        }
        return null; // No error

      default:
        return null;
    }
  };

  const handleFormChange = (name, value) => {
    let limitedValue = value;
    let error = null;

    // Prevent exceeding visual limits directly
    if (name === "itemName") {
      if (value.length > ITEM_NAME_LIMIT) {
        limitedValue = value.substring(0, ITEM_NAME_LIMIT); // Truncate visually
      }
      setItemName(limitedValue);
      error = validateField(name, limitedValue); // Validate the potentially truncated value
    } else if (name === "itemDescription") {
      if (value.length > DESCRIPTION_LIMIT) {
        limitedValue = value.substring(0, DESCRIPTION_LIMIT); // Truncate visually
      }
      setItemDescription(limitedValue);
      error = validateField(name, limitedValue); // Validate the potentially truncated value
    }

    // Update errors state
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // --- State Reset ---
  const resetState = async () => {
    setItemName("");
    setItemDescription("");
    await safeDeleteFile(mainImage);
    await safeDeleteFile(extraImage);
    setMainImage(null);
    setExtraImage(null);
    setFormErrors({});
  };

  // --- Cancel Logic ---
  const hasUnsavedChanges = () =>
    itemName.trim() !== "" ||
    itemDescription.trim() !== "" ||
    mainImage !== null ||
    extraImage !== null;
  const handleCancel = async () => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      await resetState();
      router.back();
    }
  };
  const confirmCancel = async () => {
    setShowConfirm(false);
    await resetState();
    router.back();
  };

  // --- Image Viewing/Removal Logic ---
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null);
  const viewOrPickImage = (type) => {
    const currentImageUri = type === "main" ? mainImage : extraImage;
    if (currentImageUri) {
      setImageToViewUri(currentImageUri);
      setImageTypeToClear(type);
      setShowImageViewModal(true);
    } else {
      pickImage(type === "main" ? setMainImage : setExtraImage);
    }
  };
  const handleRemoveImage = async () => {
    const uriToDelete = imageToViewUri;
    if (imageTypeToClear === "main") {
      setMainImage(null);
    } else if (imageTypeToClear === "extra") {
      setExtraImage(null);
    }
    await safeDeleteFile(uriToDelete);
    setShowImageViewModal(false);
    setImageToViewUri(null);
    setImageTypeToClear(null);
  };

  // --- Main Submission Handler ---
  const handleSubmit = async () => {
    Keyboard.dismiss(); // Dismiss keyboard first

    // --- Perform Full Validation ---
    const titleError = validateField("itemName", itemName);
    const descriptionError = validateField("itemDescription", itemDescription);
    const currentErrors = {
      itemName: titleError,
      itemDescription: descriptionError,
    };
    setFormErrors(currentErrors);
    // --- Check for Errors and Focus ---
    if (titleError || descriptionError) {
      Toast.show({
        type: "error",
        text1: t("Common_ValidationErrorTitle"), // Generic validation error title
        text2: t("Common_ValidationErrorMsg"), // Generic message
        position: "top",
      });
      // Focus on the first field with an error
      if (titleError && itemNameRef.current) {
        itemNameRef.current.focus();
      } else if (descriptionError && itemDescriptionRef.current) {
        itemDescriptionRef.current.focus();
      }
      return; // Stop submission
    }
    // --- Trim values before sending ---
    const trimmedItemName = itemName.trim();
    const trimmedItemDescription = itemDescription.trim();

    // --- Get User ID (unchanged) ---
    let currentUserId = null;
    try {
      currentUserId = await AsyncStorage.getItem("userID");
      if (!currentUserId) {
        Alert.alert(
          t("MarketplaceNewItemScreen_authErrorTitle"),
          t("MarketplaceNewItemScreen_authErrorMessage")
        );
        return;
      }
      console.log("Retrieved UserID:", currentUserId);
    } catch (e) {
      console.error("Failed to get userID from AsyncStorage", e);
      Alert.alert(
        t("MarketplaceNewItemScreen_errorTitle"),
        t("MarketplaceNewItemScreen_userInfoRetrievalError")
      );
      return;
    }

    setIsSubmitting(true);
    let mainPicId = null;
    let extraPicId = null;
    let uploadResults = null;

    // --- Step 1: Upload Pictures (unchanged logic, but ensure itemName used for alt text is trimmed) ---
    if (mainImage || extraImage) {
      const formData = new FormData();
      const picRoles = [];
      const picAlts = [];
      let fileIndex = 0;
      let mainImageIndex = -1;
      let extraImageIndex = -1;

      // Prepare Main Image data
      if (mainImage) {
        const mainFileType = mainImage.substring(
          mainImage.lastIndexOf(".") + 1
        );
        const mainMimeType = `image/${
          mainFileType === "jpg" ? "jpeg" : mainFileType
        }`;
        formData.append("files", {
          uri: mainImage,
          name: `main.${mainFileType}`,
          type: mainMimeType,
        });
        picRoles.push("marketplace");
        // Using trimmedItemName here
        picAlts.push(
          `A photo of the item ${trimmedItemName} by the seller TEMP NAME`
        ); // TRANSLATION NEEDED
        mainImageIndex = fileIndex++;
      }
      // Prepare Extra Image data
      if (extraImage) {
        const extraFileType = extraImage.substring(
          extraImage.lastIndexOf(".") + 1
        );
        const extraMimeType = `image/${
          extraFileType === "jpg" ? "jpeg" : extraFileType
        }`;
        formData.append("files", {
          uri: extraImage,
          name: `extra.${extraFileType}`,
          type: extraMimeType,
        });
        picRoles.push("marketplace_extra");
        // Using trimmedItemName here
        picAlts.push(
          `An extra photo of the item ${trimmedItemName} by the seller TEMP NAME`
        );
        extraImageIndex = fileIndex++;
      }
      // Append metadata
      picRoles.forEach((role) => formData.append("picRoles", role));
      picAlts.forEach((alt) => formData.append("picAlts", alt));
      formData.append("uploaderId", currentUserId);

      try {
        console.log("Attempting to upload images...");
        const uploadResponse = await fetch(API + "/api/Picture", {
          method: "POST",
          body: formData,
          // Consider adding timeout? headers: { 'Connection': 'close' } // May help with timeouts sometimes
        });

        // JSON parsing and error handling (unchanged)
        try {
          uploadResults = await uploadResponse.json();
        } catch (jsonError) {
          console.error("Failed to parse upload response JSON:", jsonError);
          let textResponse = "";
          try {
            textResponse = await uploadResponse.text();
          } catch {}
          throw new Error(
            `Image upload failed (status ${uploadResponse.status}). Response: ${textResponse}`
          );
        }
        if (!uploadResponse.ok && uploadResponse.status !== 207) {
          const errorMsg =
            uploadResults?.error ||
            uploadResults?.message ||
            `Image upload failed (HTTP ${uploadResponse.status})`;
          throw new Error(errorMsg);
        }
        console.log(
          "Upload response status:",
          uploadResponse.status,
          "Results:",
          uploadResults
        );

        // Pic ID extraction (unchanged)
        if (Array.isArray(uploadResults)) {
          if (mainImageIndex !== -1) {
            if (uploadResults[mainImageIndex]?.success) {
              mainPicId = uploadResults[mainImageIndex].picId;
            } else {
              throw new Error(
                `Main image failed: ${
                  uploadResults[mainImageIndex]?.errorMessage ??
                  "Unknown upload error"
                }`
              );
            }
          }
          if (extraImageIndex !== -1) {
            if (uploadResults[extraImageIndex]?.success) {
              extraPicId = uploadResults[extraImageIndex].picId;
            } else {
              console.warn(
                `Extra image failed: ${
                  uploadResults[extraImageIndex]?.errorMessage ??
                  "Unknown upload error"
                }`
              );
              extraPicId = null;
            }
          }
        } else if (uploadResponse.ok) {
          throw new Error("Image upload OK but unexpected response format.");
        }
      } catch (error) {
        console.error("Image upload step failed:", error);
        Toast.show({
          type: "error",
          text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
          text2: error.message,
          position: "top",
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      console.log("No images selected for upload.");
    }

    // --- Step 2: Create Listing (use trimmed values) ---
    const listingData = {
      Title: trimmedItemName, // Use trimmed value
      Description: trimmedItemDescription, // Use trimmed value
      SellerId: currentUserId,
      MainPicId: mainPicId,
      ExtraPicId: extraPicId,
    };

    console.log("Attempting to create listing with data:", listingData);
    try {
      const listingResponse = await fetch(API + "/api/Listings/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      if (!listingResponse.ok) {
        let errorData = {}; // Default to empty object
        try {
          errorData = await listingResponse.json();
        } catch (e) {
          console.warn("Could not parse error JSON from listing creation");
        }
        throw new Error(
          errorData?.message ||
            `Failed to create listing (HTTP ${listingResponse.status})`
        );
      }

      const finalResult = await listingResponse.json();
      Toast.show({
        type: "success",
        text1: t("MarketplaceNewItemScreen_listingCreatedTitle"),
        text2: t("MarketplaceNewItemScreen_listingCreatedSuccessMsg", {
          id: finalResult.listingId,
        }), // Use translation
        position: "top",
        // alignRight: Globals.userSelectedDirection === "rtl"
        //textAlign: Globals.userSelectedDirection === "rtl",
      });
      await resetState();
      router.back();
    } catch (error) {
      console.error("Listing creation step failed:", error);
      Toast.show({
        type: "error",
        text1: t("MarketplaceNewItemScreen_listingCreationFailedTitle"),
        text2: error.message,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Helps dismiss keyboard when tapping outside inputs
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {t(`MarketplaceNewItemScreen_NewItem`)}
            </Text>
          </View>

          <FloatingLabelInput
            ref={itemNameRef} // Assign ref
            label={t(`MarketplaceNewItemScreen_ItemName`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemName}
            onChangeText={(text) => handleFormChange("itemName", text)}
            maxLength={ITEM_NAME_LIMIT} // Enforce visual limit
          />

          {formErrors.itemName ? (
            <Text style={styles.errorText}>{formErrors.itemName}</Text>
          ) : (
            <Text style={styles.charCount}>
              {itemName.length}/{ITEM_NAME_LIMIT}
            </Text>
          )}

          <FloatingLabelInput
            ref={itemDescriptionRef} // Assign ref
            label={t(`MarketplaceNewItemScreen_ItemDescription`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemDescription}
            onChangeText={(text) => handleFormChange("itemDescription", text)}
            multiline={true}
            inputStyle={{ height: 80, textAlignVertical: "top" }} // Added textAlignVertical
            maxLength={DESCRIPTION_LIMIT} // Enforce visual limit
          />
          {formErrors.itemDescription ? (
            <Text style={styles.errorText}>{formErrors.itemDescription}</Text>
          ) : (
            <Text style={styles.charCount}>
              {itemDescription.length}/{DESCRIPTION_LIMIT}
            </Text>
          )}

          <XStack
            gap="$3"
            justifyContent="center"
            alignItems="center"
            marginVertical="$4"
          >
            <Card
              elevate
              width={150}
              height={150}
              borderRadius="$4"
              overflow="hidden"
              margin={10}
              onPress={() => viewOrPickImage("main")}
            >
              {mainImage ? (
                <>
                  
                  <Card.Background>
                    
                    <ExpoImage
                      source={{ uri: mainImage }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  </Card.Background>
                  <YStack
                    f={1}
                    jc="center"
                    ai="center"
                    backgroundColor="rgba(0,0,0,0.4)"
                  >
                    
                    <Paragraph theme="alt2">
                      {t("MarketplaceNewItemScreen_MainImage")}
                    </Paragraph>
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
                  
                  <H2 size="$5">
                    {t("MarketplaceNewItemScreen_MainImage")}
                  </H2>
                  <Paragraph theme="alt2">
                    {t("MarketplaceNewItemScreen_ImageOptional")}
                  </Paragraph>
                  <Paragraph theme="alt2">
                    {t("MarketplaceNewItemScreen_ImageTapToChoose")}
                  </Paragraph>
                </YStack>
              )}
            </Card>
            <Card
              elevate
              width={150}
              height={150}
              borderRadius="$4"
              overflow="hidden"
              onPress={() => viewOrPickImage("extra")}
            >
              {extraImage ? (
                <>
                  
                  <Card.Background>
                    
                    <ExpoImage
                      source={{ uri: extraImage }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  </Card.Background>
                  <YStack
                    f={1}
                    jc="center"
                    ai="center"
                    backgroundColor="rgba(0,0,0,0.4)"
                  >
                    
                    <Paragraph theme="alt2" color="$color">
                      {t("MarketplaceNewItemScreen_ExtraImage")}
                    </Paragraph>
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
                  
                  <H2 size="$5">
                    {t("MarketplaceNewItemScreen_ExtraImage")}
                  </H2>
                  <Paragraph theme="alt2">
                    {t("MarketplaceNewItemScreen_ImageOptional")}
                  </Paragraph>
                  <Paragraph theme="alt2">
                    {t("MarketplaceNewItemScreen_ImageTapToChoose")}
                  </Paragraph>
                </YStack>
              )}
            </Card>
          </XStack>

          <View style={styles.buttonRow}>
            <FlipButton
              onPress={handleSubmit} // handleSubmit uses updated validation
              bgColor="white"
              textColor="black"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="small" color="black" />
              ) : (
                <Text style={styles.buttonLabel}>
                  
                  {t("MarketplaceSearchItem_SubmitButton")}
                </Text>
              )}
            </FlipButton>
            <FlipButton
              onPress={handleCancel}
              bgColor="white"
              textColor="black"
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonLabel}>
                
                {t("MarketplaceSearchItem_CancelButton")}
              </Text>
            </FlipButton>
          </View>
        </View>
      </ScrollView>

      {showConfirm && (
        <Modal visible={true} transparent={true} animationType="fade">
          
          <View style={styles.confirmOverlay}>
            
            <View style={styles.confirmContainer}>
              
              <Text style={styles.confirmText}>
                {t("MarketplaceNewItemScreen_CancelDiscardHeader")}
              </Text>
              <View style={styles.confirmButtonRow}>
                
                <FlipButton
                  onPress={confirmCancel}
                  bgColor="#e0e0e0"
                  textColor="black"
                  style={styles.confirmButton}
                >
                  
                  <Text style={styles.buttonLabel}>
                    {t("MarketplaceNewItemScreen_CancelConfirmation")}
                  </Text>
                </FlipButton>
                <FlipButton
                  onPress={() => setShowConfirm(false)}
                  bgColor="#007bff"
                  textColor="white"
                  style={styles.confirmButton}
                >
                  
                  <Text style={[styles.buttonLabel, { color: "white" }]}>
                    {t("MarketplaceNewItemScreen_CancelDiscard")}
                  </Text>
                </FlipButton>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageToViewUri}
        onClose={() => {
          setShowImageViewModal(false);
          setImageToViewUri(null);
          setImageTypeToClear(null);
        }}
        onRemove={handleRemoveImage}
      />
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  contentContainer: {
    width: SCREEN_WIDTH * 0.95,
    maxHeight: SCREEN_HEIGHT * 0.95,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { flex: 1, fontSize: 24, fontWeight: "bold", textAlign: "center" },
  charCount: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 12,
    fontSize: 12,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 25,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
    backgroundColor: "#e0f0ff",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  buttonLabel: { fontSize: 16, fontWeight: "bold" },
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
  errorText: {
    color: "red",
    alignSelf: "flex-start", // Align with input start
    marginLeft: 10, // Indent slightly
    marginTop: -10, // Move closer to the input above
    marginBottom: 5, // Space before char count
    fontSize: 12, // Smaller error font size
  },
});
