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
} from "react-native";
import { Image as ExpoImage } from "expo-image";
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
import Header from "@/components/Header";

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
  const [showConfirm, setShowConfirm] = useState(false); // "Are you sure?" modal
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission process has begun
  const [formErrors, setFormErrors] = useState({}); // Do we have any errors?

  const [originalMainPicId, setOriginalMainPicId] = useState(null); // Store original ID for deletion check
  const [originalExtraPicId, setOriginalExtraPicId] = useState(null);

  const params = useLocalSearchParams(); // Are we on edit or new item mode?
  const API = Globals.API_BASE_URL;

  const isEditMode = params.mode === "edit";

  const initialData = useMemo(() => {
    // Do we have initial data ( are we editing a listing )?
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

  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);

  const router = useRouter();

  const ITEM_NAME_LIMIT = 100;
  const DESCRIPTION_LIMIT = 300;
  const ESCAPED_DESCRIPTION_LIMIT = 400;

  const copyImageToAppDir = async (sourceUri, prefix) => {
    // Copying a temporary image before server upload to a local library
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
    // if we're editing a listing, we populate the variables for the form
    if (isEditMode && initialData) {
      console.log("Edit Mode: Pre-filling form with:", initialData);
      setItemName(initialData.title || "");
      setItemDescription(initialData.description || "");

      // Set image URIs for display ( full URLs from server)
      const initialMainUrl = initialData.mainPicture?.picPath
        ? `${Globals.API_BASE_URL}${initialData.mainPicture.picPath}`
        : null;
      const initialExtraUrl = initialData.extraPicture?.picPath
        ? `${Globals.API_BASE_URL}${initialData.extraPicture.picPath}`
        : null;

      setMainImage(initialMainUrl);
      setExtraImage(initialExtraUrl);

      setOriginalMainPicId(initialData.mainPicture?.picId || null);
      setOriginalExtraPicId(initialData.extraPicture?.picId || null);
    }
  }, [isEditMode, initialData]);

  // Helper to delete local files when they're not needed anymore ( cancelled / uploaded to server already)
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

  // Image Picker - Image library or a new photo
  const pickImage = async (setImage) => {
    // Step 3 : this setImage is a Hook Setter - the uri value we pass into it is the new photo candidate
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

  // Field verification - we're escaping special characters ( in the serverside ) to avoid SQL attacks. This calculates length with escapes.
  const validateField = (name, value) => {
    const trimmedValue = value;
    switch (name) {
      case "itemName":
        if (!trimmedValue.trim()) {
          return t("MarketplaceNewItemScreen_errorTitleRequired");
        }
        if (value.length >= ITEM_NAME_LIMIT) {
          return t("MarketplaceNewItemScreen_errorTitleTooLong", {
            count: ITEM_NAME_LIMIT,
          });
        }
        return null;

      case "itemDescription":
        // check raw length against DB limit
        if (value.length >= DESCRIPTION_LIMIT) {
          return t("MarketplaceNewItemScreen_errorDescriptionTooLong", {
            count: DESCRIPTION_LIMIT,
          });
        }

        const estimatedLength = estimateEscapedLength(value);
        if (estimatedLength >= ESCAPED_DESCRIPTION_LIMIT) {
          return t(
            "MarketplaceNewItemScreen_errorDescriptionTooManySpecialChars",
            {
              count: ESCAPED_DESCRIPTION_LIMIT,
            }
          );
        }
        return null;

      default:
        return null;
    }
  };

  const handleFormChange = (name, value) => {
    let limitedValue = value;
    let error = null;

    if (name === "itemName") {
      if (value.length > ITEM_NAME_LIMIT) {
        limitedValue = value.substring(0, ITEM_NAME_LIMIT); // Cut visually
      }
      setItemName(limitedValue);
      error = validateField(name, limitedValue); // Validate the potentially cut value
    } else if (name === "itemDescription") {
      if (value.length > DESCRIPTION_LIMIT) {
        limitedValue = value.substring(0, DESCRIPTION_LIMIT); // cut visually
      }
      setItemDescription(limitedValue);
      error = validateField(name, limitedValue); // Validate the potentially cut value
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const resetState = async () => {
    setItemName("");
    setItemDescription("");
    await safeDeleteFile(mainImage);
    await safeDeleteFile(extraImage);
    setMainImage(null);
    setExtraImage(null);
    setFormErrors({});
    setOriginalMainPicId(null);
    setOriginalExtraPicId(null);
  };

  // Cancel Logic
  const handleCancel = async () => {
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
  const [imageToViewUri, setImageToViewUri] = useState(null); // Image currently being viewed
  const [imageTypeToClear, setImageTypeToClear] = useState(null); // Are we clearing the main or extra?

  const viewOrPickImage = (type) => {
    // Step 2 : after user clicks the card, we check if type is main or not. if it is and there's a URI, it's of the main's image.
    const currentImageUri = type === "main" ? mainImage : extraImage;
    if (currentImageUri) {
      setImageToViewUri(currentImageUri);
      setImageTypeToClear(type);
      setShowImageViewModal(true);
    } else {
      // If there's no image assgined to the card, we trigger the image picker W/ a hook setter!
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

  const uploadImage = async (imageUri, role, altText, uploaderId) => {
    if (!imageUri || !imageUri.startsWith("file://")) {
      console.log(
        `Skipping upload for non-local file or null URI: ${imageUri}`
      );
      return null;
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
      console.log(`Upload successful for ${role}:`, uploadResults[0]);
      await safeDeleteFile(imageUri);
      return uploadResults[0].picId;
    } catch (error) {
      console.error(`Image upload failed for ${role}:`, error);
      Toast.show({
        type: "error",
        text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
        text2: error.message,
        position: "top",
      });

      throw error;
    }
  };

  const deletePicture = async (pictureId) => {
    if (!pictureId) return;
    console.log(`Attempting to delete picture ID: ${pictureId} via API...`);
    try {
      // You need the user's ID to send in the request body
      const userId = await AsyncStorage.getItem("userID");
      if (!userId) {
        throw new Error("User ID not found. Cannot proceed with deletion.");
      }

      const response = await fetch(`${API}/api/Picture/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PicId: pictureId,
          UserId: userId,
        }),
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
    } catch (err) {
      console.error(`Failed to delete picture ID ${pictureId}:`, err);

      Toast.show({
        type: "warning",
        text1: t("MarketplaceItemScreen_PicDeleteErrorTitle"),
        text2: err.message,
      });
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    const titleError = validateField("itemName", itemName);
    const descriptionError = validateField("itemDescription", itemDescription);
    const currentErrors = {
      itemName: titleError,
      itemDescription: descriptionError,
    };
    setFormErrors(currentErrors);

    if (titleError || descriptionError) {
      Toast.show({
        type: "error",
        text1: t("Common_ValidationErrorTitle"),
        text2: t("Common_ValidationErrorMsg"),
        position: "top",
      });

      if (titleError && itemNameRef.current) {
        itemNameRef.current.focus();
      } else if (descriptionError && itemDescriptionRef.current) {
        itemDescriptionRef.current.focus();
      }
      return;
    }

    const trimmedItemName = itemName.trim();
    const trimmedItemDescription = itemDescription.trim();

    let currentUserId = null;
    try {
      currentUserId = await AsyncStorage.getItem("userID");
      if (!currentUserId) {
        // Changed to throw error for consistency
        throw new Error(t("MarketplaceNewItemScreen_authErrorMessage"));
      }
      console.log("Retrieved UserID:", currentUserId);
    } catch (e) {
      console.error("Failed to get userID from AsyncStorage", e);
      Alert.alert(
        t("MarketplaceNewItemScreen_errorTitle"),
        e.message || t("MarketplaceNewItemScreen_userInfoRetrievalError")
      );
      return;
    }

    setIsSubmitting(true);
    let finalMainPicId = isEditMode ? originalMainPicId : null;
    let finalExtraPicId = isEditMode ? originalExtraPicId : null;
    let picsToDeleteOnSuccess = [];

    try {
      // Step 1a: Main Picture
      if (mainImage && mainImage.startsWith("file://")) {
        // New photo selected, temp from device
        if (isEditMode && originalMainPicId)
          picsToDeleteOnSuccess.push(originalMainPicId); // Mark old one for deletion if we're in edit mode
        const altText = `Main photo for ${trimmedItemName}`; // Alt text for photo
        finalMainPicId = await uploadImage(
          mainImage,
          "marketplace",
          altText,
          currentUserId
        ); // uploading the new Photo to ther server and getting its ID
      } else if (mainImage === null && isEditMode && originalMainPicId) {
        // main photo was removed in edit mode
        picsToDeleteOnSuccess.push(originalMainPicId);
        finalMainPicId = null;
      }

      // Step 2a: Handle Extra Image - same as Main
      if (extraImage && extraImage.startsWith("file://")) {
        if (isEditMode && originalExtraPicId)
          picsToDeleteOnSuccess.push(originalExtraPicId);
        const altText = `Extra photo for ${trimmedItemName}`;
        finalExtraPicId = await uploadImage(
          extraImage,
          "marketplace_extra",
          altText,
          currentUserId
        );
      } else if (extraImage === null && isEditMode && originalExtraPicId) {
        picsToDeleteOnSuccess.push(originalExtraPicId);
        finalExtraPicId = null;
      }

      // Step 3a: Create or Update Listing
      if (isEditMode) {
        const currentListingId = initialData?.listingId;
        if (!currentListingId) {
          // Safety check
          throw new Error("Missing Listing ID for update.");
        }
        const updateDto = {
          Title: trimmedItemName,
          Description: trimmedItemDescription,
          MainPicId: finalMainPicId,
          ExtraPicId: finalExtraPicId,
        };
        console.log(
          `Attempting to update listing ID: ${currentListingId} with data:`,
          updateDto
        );

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

        Toast.show({
          type: "success",
          text1: t("MarketplaceEditItemScreen_UpdateSuccess"),
        });
        // Here we delete old pictures *after* a successful update
        // Use Promise.allSettled to attempt all deletions even if one fails
        const deleteResults = await Promise.allSettled(
          picsToDeleteOnSuccess.map((picId) => deletePicture(picId))
        );
        deleteResults.forEach((result) => {
          if (result.status === "rejected") {
            console.error(
              "Failed to delete an old picture during update:",
              result.reason
            );
          }
        });
        router.back(); // Go back after successful update and attempted deletions
      } else {
        // Creating a list - not in edit mode
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
          text1: t("MarketplaceNewItemScreen_listingCreatedTitle"),
          text2: t("MarketplaceNewItemScreen_listingCreatedSuccessMsg", {
            id: finalResult.listingId,
          }),
          position: "top",
        });
        await resetState(); // Reset state only after successful creation
        router.back();
      }

      // The duplicated logic block has been removed here.
    } catch (error) {
      console.error("Listing submission step failed:", error);
      // Display the actual error message
      Toast.show({
        type: "error",
        text1: t("Common_Error"),
        text2:
          error.message || t("MarketplaceNewItemScreen_submitListingFailed"),
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            ref={itemNameRef}
            label={t(`MarketplaceNewItemScreen_ItemName`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemName}
            onChangeText={(text) => handleFormChange("itemName", text)}
            maxLength={ITEM_NAME_LIMIT}
          />

          {formErrors.itemName ? (
            <Text style={styles.errorText}>{formErrors.itemName}</Text>
          ) : (
            <Text style={styles.charCount}>
              {itemName.length}/{ITEM_NAME_LIMIT}
            </Text>
          )}

          <FloatingLabelInput
            ref={itemDescriptionRef}
            label={t(`MarketplaceNewItemScreen_ItemDescription`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemDescription}
            onChangeText={(text) => handleFormChange("itemDescription", text)}
            multiline={true}
            inputStyle={{ height: 80, textAlignVertical: "top" }}
            maxLength={DESCRIPTION_LIMIT}
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
              onPress={() => viewOrPickImage("main")} // Step 1 of picking or viewing the card's image
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
              onPress={() => viewOrPickImage("extra")} // Step 1 of picking or viewing the card's image
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
              onPress={handleSubmit}
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
          <Modal visible={true} transparent={true} animationType="fade"></Modal>
        )}
        <ImageViewModal
          visible={showImageViewModal}
          imageUri={imageToViewUri}
          onClose={() => {}}
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
    alignSelf: "flex-start",
    marginLeft: 10,
    marginTop: -10,
    marginBottom: 5,
    fontSize: 12,
  },
});
