import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Toast } from "toastify-react-native";
import FlipButton from "../components/FlipButton";
import ImageViewModal from "../components/ImageViewModal";
import FloatingLabelInput from "../components/FloatingLabelInput";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import { Keyboard } from "react-native";

import { Card, H2, Paragraph, XStack, YStack, Spinner } from "tamagui";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Globals.SCREEN_WIDTH;

function estimateEscapedLength(str) {
  if (!str) return 0;
  let estimatedLength = str.length;
  estimatedLength += (str.match(/'/g) || []).length;
  return estimatedLength;
}

export default function AddNewItem() {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [originalMainPicId, setOriginalMainPicId] = useState(null); // Store original ID for deletion check
  const [originalExtraPicId, setOriginalExtraPicId] = useState(null);

  const params = useLocalSearchParams();
  const API = Globals.API_BASE_URL;

  const isEditMode = params.mode === "edit";

  const initialData = useMemo(() => {
    if (!params.listingData) {
      return null;
    }
    try {
      return JSON.parse(params.listingData);
    } catch (e) {
      console.error("Failed to parse listingData param:", e);
      return null;
    }
  }, [params.listingData]);

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

  useEffect(() => {
    if (isEditMode && initialData) {
      console.log("Edit Mode: Pre-filling form with:", initialData);
      setItemName(initialData.title || "");
      setItemDescription(initialData.description || "");

      // Set image URIs for display (these are full URLs from server)
      const initialMainUrl = initialData.mainPicture?.picPath
        ? `${Globals.API_BASE_URL}${initialData.mainPicture.picPath}`
        : null;
      const initialExtraUrl = initialData.extraPicture?.picPath
        ? `${Globals.API_BASE_URL}${initialData.extraPicture.picPath}`
        : null;

      setMainImage(initialMainUrl);
      setExtraImage(initialExtraUrl);

      // Store original IDs
      setOriginalMainPicId(initialData.mainPicture?.picId || null);
      setOriginalExtraPicId(initialData.extraPicture?.picId || null);
    }
  }, [isEditMode, initialData]);

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

  // Resetting the form
  const resetState = async () => {
    setItemName("");
    setItemDescription("");
    // Only delete file URIs, not HTTP URIs
    await safeDeleteFile(mainImage);
    await safeDeleteFile(extraImage);
    setMainImage(null);
    setExtraImage(null);
    setFormErrors({});
    setOriginalMainPicId(null);
    setOriginalExtraPicId(null); // Reset original IDs too
  };

  // --- Cancel Logic ---
  const handleCancel = async () => {
    // In edit mode, simply go back without confirmation for now, or add confirmation if needed
    if (isEditMode) {
      router.back();
      return;
    }
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
  const hasUnsavedChanges = () =>
    itemName.trim() !== (initialData?.title || "") ||
    itemDescription.trim() !== (initialData?.description || "") ||
    (mainImage && mainImage.startsWith("file://")) ||
    (extraImage && extraImage.startsWith("file://")) ||
    (isEditMode && mainImage === null && originalMainPicId !== null) ||
    (isEditMode && extraImage === null && originalExtraPicId !== null);

  // --- Image Viewing/Removal Logic ---
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null);

  const viewOrPickImage = (type) => {
    const currentImageUri = type === "main" ? mainImage : extraImage;
    if (currentImageUri) {
      // If it's an existing image (http) or a newly picked one (file)
      setImageToViewUri(currentImageUri);
      setImageTypeToClear(type); // Keep track of which image slot it is
      setShowImageViewModal(true);
    } else {
      // If null, trigger image picker
      pickImage(type === "main" ? setMainImage : setExtraImage);
    }
  };

  const handleRemoveImage = async () => {
    const uriToDelete = imageToViewUri; // The URI currently being viewed

    if (imageTypeToClear === "main") {
      setMainImage(null); // Clear the state URI
    } else if (imageTypeToClear === "extra") {
      setExtraImage(null);
    }

    // Only delete the local file if it's a newly selected one
    await safeDeleteFile(uriToDelete);

    setShowImageViewModal(false);
    setImageToViewUri(null);
    setImageTypeToClear(null);
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

    try {
      const uploadResponse = await fetch(`${API}/api/Picture`, {
        method: "POST",
        body: formData,
      });
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

  const deletePicture = async (pictureId) => {
    if (!pictureId) return; // No ID to delete
    console.log(`Attempting to delete picture ID: ${pictureId} via API...`);
    try {
      // ** TODO: Implement Backend Call **
      // Requires: DELETE /api/Picture/{pictureId} endpoint
      const response = await fetch(`${API}/api/Picture/${pictureId}`, {
        method: "DELETE",
        // Add Auth headers if needed
      });

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

  // --- Main Submission Handler ---
  const handleSubmit = async () => {
    Keyboard.dismiss();

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
    let finalMainPicId = isEditMode ? originalMainPicId : null;
    let finalExtraPicId = isEditMode ? originalExtraPicId : null;
    let picsToDeleteOnSuccess = [];

    // --- Step 1: Upload Pictures (unchanged logic, but ensure itemName used for alt text is trimmed) ---
    try {
      // --- Step 1: Handle Main Image ---
      if (mainImage && mainImage.startsWith("file://")) {
        // New image selected
        if (isEditMode && originalMainPicId)
          picsToDeleteOnSuccess.push(originalMainPicId); // Mark old one for deletion
        const altText = `Main photo for ${trimmedItemName}`; // Generate Alt Text
        finalMainPicId = await uploadImage(
          mainImage,
          "marketplace",
          altText,
          currentUserId
        );
      } else if (mainImage === null && isEditMode && originalMainPicId) {
        // Image explicitly removed
        picsToDeleteOnSuccess.push(originalMainPicId);
        finalMainPicId = null;
      }

      // --- Step 2: Handle Extra Image ---
      if (extraImage && extraImage.startsWith("file://")) {
        // New image selected
        if (isEditMode && originalExtraPicId)
          picsToDeleteOnSuccess.push(originalExtraPicId); // Mark old one for deletion
        const altText = `Extra photo for ${trimmedItemName}`; // Generate Alt Text
        finalExtraPicId = await uploadImage(
          extraImage,
          "marketplace_extra",
          altText,
          currentUserId
        );
      } else if (extraImage === null && isEditMode && originalExtraPicId) {
        // Image explicitly removed
        picsToDeleteOnSuccess.push(originalExtraPicId);
        finalExtraPicId = null;
      }

      // --- Step 3: Create or Update Listing ---
      if (isEditMode) {
        const currentListingId = initialData?.listingId;
        const updateDto = {
          // ListingId is needed for the URL, not usually the body
          Title: trimmedItemName,
          Description: trimmedItemDescription,
          // SellerId typically shouldn't change, but include if API allows/requires
          MainPicId: finalMainPicId,
          ExtraPicId: finalExtraPicId,
          // Add any other fields your Update DTO needs (like IsActive?)
        };
        console.log(
          `Attempting to update listing ID: ${currentListingId} with data:`,
          updateDto
        );

        // ** TODO: Implement Backend Call **
        // Requires: PUT /api/Listings/{id} endpoint
        const updateResponse = await fetch(
          `${API}/api/Listings/${currentListingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" /* Add Auth */ },
            body: JSON.stringify(updateDto),
          }
        );

        if (!updateResponse.ok) {
          let errorData = {};
          try {
            errorData = await updateResponse.json();
          } catch {}
          throw new Error(
            errorData?.message ||
              `Failed to update listing (HTTP ${updateResponse.status})`
          );
        }

        //  const updateResult = await updateResponse.json(); // Or handle 204 No Content if API returns that

        Toast.show({
          type: "success",
          text1: t("MarketplaceEditItemScreen_UpdateSuccess"),
          duration: 3500, // Custom duration
          position: "top", // Example: 'top' or 'bottom'
        });
        // Now delete old pictures *after* successful update
        for (const picId of picsToDeleteOnSuccess) {
          await deletePicture(picId); // Await deletion, but maybe don't stop if one fails
        }
        router.back(); // Go back after successful update and attempted deletions
      } else {
        // --- CREATE --- (Original Logic)
        const listingData = {
          Title: trimmedItemName,
          Description: trimmedItemDescription,
          SellerId: currentUserId,
          MainPicId: finalMainPicId,
          ExtraPicId: finalExtraPicId,
        };
        console.log("Attempting to create listing with data:", listingData);
        const listingResponse = await fetch(`${API}/api/Listings/Create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" /* Add Auth */ },
          body: JSON.stringify(listingData),
        });
        if (!listingResponse.ok) {
          let errorData = {};
          try {
            errorData = await listingResponse.json();
          } catch (e) {}
          throw new Error(
            errorData?.message ||
              `Failed to create listing (HTTP ${listingResponse.status})`
          );
        }
        const finalResult = await listingResponse.json();
        Toast.show({
          type: "success",
          text1: t("MarketplaceNewItemScreen_listingCreatedSuccessTitle"),
          // text2: t("MarketplaceNewItemScreen_listingCreatedSuccessMsg", {
          //   id: finalResult.listingId,
          // }),
          position: "top",
        });
        await resetState(); // Reset state only after successful creation
        router.back();
      }
    } catch (error) {
      // Catch errors from upload, update, or create steps
      console.error("Listing submission step failed:", error);
      // Toast was likely already shown in uploadImage or deletePicture, or show generic one here
      // Toast.show({ type: "error", text1: t(isEditMode ? "MarketplaceEditItemScreen_UpdateFailedTitle" : "MarketplaceNewItemScreen_listingCreationFailedTitle"), text2: error.message, position: "top" });
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
              {t(
                isEditMode
                  ? "MarketplaceEditItemScreen_Header"
                  : "MarketplaceNewItemScreen_NewItem"
              )}
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
                  <H2 size="$5">{t("MarketplaceNewItemScreen_MainImage")}</H2>
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
                  <H2 size="$5">{t("MarketplaceNewItemScreen_ExtraImage")}</H2>
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
        {!isEditMode && showConfirm && (
          <Modal visible={true} transparent={true} animationType="fade">
            
            {/* ... */}
          </Modal>
        )}
        <ImageViewModal
          visible={showImageViewModal}
          imageUri={imageToViewUri}
          onClose={() => {
            /* ... */
          }}
          onRemove={handleRemoveImage}
        />
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
