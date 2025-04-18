import React, {
  useState,
  useContext,
  useEffect /* Add if needed */,
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
import { useRouter } from "expo-router";
import { Toast } from "toastify-react-native";
import FlipButton from "../components/FlipButton";
import ImageViewModal from "../components/ImageViewModal";
import FloatingLabelInput from "../components/FloatingLabelInput";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals}  from "@/app/constants/Globals"

import { Card, H2, Paragraph, XStack, YStack, Spinner } from "tamagui";



const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function AddNewItem() {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const API = Globals.API_BASE_URL;

  console.log("THIS IS API:" + API)


  // State for Local Image URIs
  const [mainImage, setMainImage] = useState(null); // Stores LOCAL URI after picking/copying
  const [extraImage, setExtraImage] = useState(null); // Stores LOCAL URI after picking/copying

  const router = useRouter();

  const ITEM_NAME_LIMIT = 50;
  const DESCRIPTION_LIMIT = 200;

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
  const pickImage = async (setImage) => {
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.status !== "granted") {
      Alert.alert(
        t("ImagePicker_permissionDeniedTitle"),
        t("ImagePicker_libraryPermissionDeniedMessage"),
        [{ text: t("ImagePicker_cancelButton") }],
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
                [{ text: t("ImagePicker_cancelButton") }],
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
                  "camera",
                );
                setImage(newUri);
              } catch (copyError) {
                Alert.alert(
                  t("ImagePicker_errorTitle"),
                  t("ImagePicker_saveCameraImageFailure"),
                  [{ text: t("ImagePicker_cancelButton") }],
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
                    "library",
                  );
                  setImage(newUri);
                } catch (copyError) {
                  Alert.alert(
                    t("ImagePicker_errorTitle"),
                    t("ImagePicker_saveLibraryImageFailure"),
                    [{ text: t("ImagePicker_cancelButton") }],
                  );
                  setImage(null);
                }
              }
            } catch (error) {
              Alert.alert(
                t("ImagePicker_errorTitle"),
                t("ImagePicker_openLibraryFailure"),
                [{ text: t("ImagePicker_cancelButton") }],
              );
            }
          },
        },
        { text: t("ImagePicker_cancelButton"), style: "cancel" },
      ],
    );
  };
  

  // --- State Reset ---
  const resetState = async () => {
    setItemName('');
    setItemDescription('');
    await safeDeleteFile(mainImage);
    await safeDeleteFile(extraImage);
    setMainImage(null);
    setExtraImage(null);
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
    // --- Client-Side Validation ---
    if (!itemName.trim()) {
      Alert.alert(
        t("MarketplaceNewItemScreen_missingInfoTitle"),
        t("MarketplaceNewItemScreen_missingInfoMessage"),
      );
      return;
    }
    
    // --- Get User ID ---
    let currentUserId = null;
    try {
      currentUserId = await AsyncStorage.getItem("userID");
      if (!currentUserId) {
        Alert.alert(
          t("MarketplaceNewItemScreen_authErrorTitle"),
          t("MarketplaceNewItemScreen_authErrorMessage"),
        );
        return;
      }
      console.log("Retrieved UserID:", currentUserId);
    } catch (e) {
      console.error("Failed to get userID from AsyncStorage", e);
      Alert.alert(
        t("MarketplaceNewItemScreen_errorTitle"),
        t("MarketplaceNewItemScreen_userInfoRetrievalError"),
      );
      return;
    }
    

    setIsSubmitting(true);
    let mainPicId = null;
    let extraPicId = null;
    let uploadResults = null;

    // --- Step 1: Upload Pictures (if any selected) ---
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
        picAlts.push("A photo of the item " + {itemName} + " by the seller " + "TEMP NAME");
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
        picAlts.push("An extra photo of the item " + {itemName} + " by the seller " + "TEMP NAME");
        extraImageIndex = fileIndex++;
      }
      // Append metadata
      picRoles.forEach((role) => formData.append("picRoles", role));
      picAlts.forEach((alt) => formData.append("picAlts", alt));
      formData.append("uploaderId", currentUserId); 

      try {
        console.log("Attempting to upload images...");

        const uploadResponse = await fetch(
          API + "/api/Picture",
          {
            method: "POST",
            body: formData,
          }
        );

        try {
          uploadResults = await uploadResponse.json();
        } catch (jsonError) {
          console.error("Failed to parse upload response JSON:", jsonError);
          let textResponse = "";
          try {
            textResponse = await uploadResponse.text();
          } catch {}
          throw new Error(
            `Image upload failed with status ${uploadResponse.status}. Could not parse response. Response text: ${textResponse}`
          );
        }

        // Handle response status
        if (!uploadResponse.ok && uploadResponse.status !== 207) {
          // Treat 207 as potentially recoverable below
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

        // Extract PicIds - Safely check if uploadResults is an array and index exists
        if (Array.isArray(uploadResults)) {
          if (mainImageIndex !== -1) {
            // If main image was sent
            if (uploadResults[mainImageIndex]?.success) {
              mainPicId = uploadResults[mainImageIndex].picId;
            } else {
              // Main image upload failed, this is critical
              throw new Error(
                `Main image failed to process: ${
                  uploadResults[mainImageIndex]?.errorMessage ??
                  "Unknown upload error"
                }`
              );
            }
          }
          if (extraImageIndex !== -1) {
            // If extra image was sent
            if (uploadResults[extraImageIndex]?.success) {
              extraPicId = uploadResults[extraImageIndex].picId;
            } else {
              // Log warning but allow proceeding if only extra failed
              console.warn(
                `Extra image failed to process: ${
                  uploadResults[extraImageIndex]?.errorMessage ??
                  "Unknown upload error"
                }`
              );
              extraPicId = null; // Ensure it's null
            }
          }
        } else if (uploadResponse.ok) {
          // Status was OK but response wasn't an array - unexpected server format
          throw new Error(
            "Image upload succeeded but received an unexpected response format."
          );
        }
        // If !uploadResponse.ok and not 207, an error was already thrown above
      } catch (error) {
        console.error("Image upload step failed:", error);
        Toast.show({
          type: "error",
          text1: t("MarketplaceNewItemScreen_imageUploadFailedTitle"),
          text2: error.message,
          position: "top",
        });
        setIsSubmitting(false);
        return; // Stop submission
      }
    } else {
      console.log("No images selected for upload.");
    }

    // --- Step 2: Create Listing ---
    const listingData = {
      Title: itemName,
      Description: itemDescription,
      SellerId: currentUserId,
      MainPicId: mainPicId,
      ExtraPicId: extraPicId,
    };

    console.log("Attempting to create listing with data:", listingData);
    try {
      // <<< REPLACE WITH YOUR SERVER IP and correct endpoint >>>
      const listingResponse = await fetch(
         API + "/api/Listings/Create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(listingData),
        }
      );

      if (!listingResponse.ok) {
        const errorData = await listingResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to create listing (HTTP ${listingResponse.status})`
        );
      }

      const finalResult = await listingResponse.json();
      Toast.show({
        type: "success",
        text1: t("MarketplaceNewItemScreen_listingCreatedTitle"),
        text2: `ID: ${finalResult.listingId}`,
        position: "top",
        // alignRight: Globals.userSelectedDirection === "rtl"
        //textAlign: Globals.userSelectedDirection === "rtl",
      });
      await resetState(); // Clean up local files and state
      router.back(); // Navigate back only on full success
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

  // --- JSX Render ---
  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ... Your existing JSX structure ... */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {t(`MarketplaceNewItemScreen_NewItem`)}
            </Text>
          </View>
          <FloatingLabelInput
            label={t(`MarketplaceNewItemScreen_ItemName`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemName}
            onChangeText={(text) =>
              text.length <= ITEM_NAME_LIMIT && setItemName(text)
            }
          />
          <Text style={styles.charCount}>
            {itemName.length}/{ITEM_NAME_LIMIT}
          </Text>
          <FloatingLabelInput
            label={t(`MarketplaceNewItemScreen_ItemDescription`)}
            alignRight={Globals.userSelectedDirection === "rtl"}
            value={itemDescription}
            onChangeText={(text) =>
              text.length <= DESCRIPTION_LIMIT && setItemDescription(text)
            }
            multiline={true}
            inputStyle={{ height: 80 }}
          />
          <Text style={styles.charCount}>
            {itemDescription.length}/{DESCRIPTION_LIMIT}
          </Text>
          <XStack
            space="$3"
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
                <YStack f={1} jc="center" ai="center" p="$2" style={{ direction: Globals.userSelectedDirection }}>
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
                <YStack f={1} jc="center" ai="center" p="$2" style={{ direction: Globals.userSelectedDirection }}>
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
    width: "100%",
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
});
