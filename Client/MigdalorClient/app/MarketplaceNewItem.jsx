import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Keyboard,
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
import Header from "@/components/Header";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext"; // Import useSettings

import { Card, YStack, Spinner } from "tamagui";

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
  const { settings } = useSettings(); // Get settings from context
  const useColumnLayout = settings.fontSizeMultiplier >= 2; // Determine layout based on font size

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [originalMainPicId, setOriginalMainPicId] = useState(null);
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

  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);

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
        limitedValue = value.substring(0, ITEM_NAME_LIMIT);
      }
      setItemName(limitedValue);
      error = validateField(name, limitedValue);
    } else if (name === "itemDescription") {
      if (value.length > DESCRIPTION_LIMIT) {
        limitedValue = value.substring(0, DESCRIPTION_LIMIT);
      }
      setItemDescription(limitedValue);
      error = validateField(name, limitedValue);
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
      if (mainImage && mainImage.startsWith("file://")) {
        if (isEditMode && originalMainPicId)
          picsToDeleteOnSuccess.push(originalMainPicId);
        const altText = `Main photo for ${trimmedItemName}`;
        finalMainPicId = await uploadImage(
          mainImage,
          "marketplace",
          altText,
          currentUserId
        );
      } else if (mainImage === null && isEditMode && originalMainPicId) {
        picsToDeleteOnSuccess.push(originalMainPicId);
        finalMainPicId = null;
      }

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

      if (isEditMode) {
        const currentListingId = initialData?.listingId;
        if (!currentListingId) {
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
            headers: { "Content-Type": "application/json" },
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
        router.back();
      } else {
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
          headers: { "Content-Type": "application/json" },
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
        await resetState();
        router.back();
      }
    } catch (error) {
      console.error("Listing submission step failed:", error);
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
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerPlaque}>
          <StyledText style={styles.title}>
            {t(
              isEditMode
                ? "MarketplaceEditItemScreen_Header"
                : "MarketplaceNewItemScreen_NewItem"
            )}
          </StyledText>
        </View>

        <View style={styles.formPlaque}>
          <FloatingLabelInput
            ref={itemNameRef}
            label={t(`MarketplaceNewItemScreen_ItemName`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemName}
            onChangeText={(text) => handleFormChange("itemName", text)}
            maxLength={ITEM_NAME_LIMIT}
          />

          {formErrors.itemName ? (
            <StyledText style={{...styles.errorText, alignSelf: Globals.userSelectedDirection === "rtl" ? "flex-end" : "flex-start"}}>
              {formErrors.itemName}
            </StyledText>
          ) : (
            <StyledText style={styles.charCount}>
              {itemName.length}/{ITEM_NAME_LIMIT}
            </StyledText>
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
            <StyledText style={{...styles.errorText, alignSelf: Globals.userSelectedDirection === "rtl" ? "flex-end" : "flex-start"}}>
              {formErrors.itemDescription}
            </StyledText>
          ) : (
            <StyledText style={styles.charCount}>
              {itemDescription.length}/{DESCRIPTION_LIMIT}
            </StyledText>
          )}

          <View
            style={[
              styles.imageContainer,
              useColumnLayout && styles.imageContainerColumn,
            ]}
          >
            <Card
              elevate
              width={useColumnLayout ? SCREEN_WIDTH * 0.8 : 150}
              height={useColumnLayout ? SCREEN_WIDTH * 0.8 : 150}
              borderRadius="$4"
              overflow="hidden"
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
                    <StyledText style={styles.imageOverlayText}>
                      {t("MarketplaceNewItemScreen_MainImage")}
                    </StyledText>
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
                  <StyledText style={styles.imageCardHeader}>
                    {t("MarketplaceNewItemScreen_MainImage")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("MarketplaceNewItemScreen_ImageOptional")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("MarketplaceNewItemScreen_ImageTapToChoose")}
                  </StyledText>
                </YStack>
              )}
            </Card>
            <Card
              elevate
              width={useColumnLayout ? SCREEN_WIDTH * 0.8 : 150}
              height={useColumnLayout ? SCREEN_WIDTH * 0.8 : 150}
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
                    <StyledText style={styles.imageOverlayText}>
                      {t("MarketplaceNewItemScreen_ExtraImage")}
                    </StyledText>
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
                  <StyledText style={styles.imageCardHeader}>
                    {t("MarketplaceNewItemScreen_ExtraImage")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("MarketplaceNewItemScreen_ImageOptional")}
                  </StyledText>
                  <StyledText style={styles.imageCardParagraph}>
                    {t("MarketplaceNewItemScreen_ImageTapToChoose")}
                  </StyledText>
                </YStack>
              )}
            </Card>
          </View>

          <View
            style={[styles.buttonRow, useColumnLayout && styles.buttonColumn]}
          >
            <FlipButton
              onPress={handleSubmit}
              bgColor="white"
              textColor="black"
              style={[
                styles.submitButton,
                useColumnLayout && styles.fullWidthButton,
              ]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="small" color="black" />
              ) : (
                <StyledText style={styles.buttonLabel}>
                  {t("MarketplaceSearchItem_SubmitButton")}
                </StyledText>
              )}
            </FlipButton>
            <FlipButton
              onPress={handleCancel}
              bgColor="white"
              textColor="black"
              style={[
                styles.cancelButton,
                useColumnLayout && styles.fullWidthButton,
              ]}
              disabled={isSubmitting}
            >
              <StyledText style={styles.buttonLabel}>
                {t("MarketplaceSearchItem_CancelButton")}
              </StyledText>
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
              <StyledText style={styles.confirmText}>
                {t("MarketplaceNewItemScreen_CancelDiscardHeader")}
              </StyledText>
              <View style={styles.confirmButtonRow}>
                <FlipButton
                  onPress={confirmCancel}
                  bgColor="#e0e0e0"
                  textColor="black"
                  style={styles.confirmButton}
                >
                  <StyledText style={styles.buttonLabel}>
                    {t("MarketplaceNewItemScreen_CancelConfirmation")}
                  </StyledText>
                </FlipButton>
                <FlipButton
                  onPress={() => setShowConfirm(false)}
                  bgColor="#007bff"
                  textColor="white"
                  style={styles.confirmButton}
                >
                  <StyledText style={[styles.buttonLabel, { color: "white" }]}>
                    {t("MarketplaceNewItemScreen_CancelDiscard")}
                  </StyledText>
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
  screenContainer: { flex: 1, backgroundColor: "#f7e7ce" }, // Champagne background
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingTop: 80, // Add padding to account for Header
  },
  headerPlaque: {
    width: SCREEN_WIDTH * 0.95,
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
    width: SCREEN_WIDTH * 0.95,
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
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  charCount: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 12,
    fontSize: 12,
    color: "#666",
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginVertical: 20,
  },
  imageContainerColumn: {
    flexDirection: "column",
    gap: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 25,
  },
  buttonColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
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
  fullWidthButton: {
    width: "90%",
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
  imageOverlayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
