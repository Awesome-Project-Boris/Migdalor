import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";

// --- Custom Component and Context Imports ---
import { useSettings } from "@/context/SettingsContext";
import StyledText from "@/components/StyledText";

const placeholderImage = require("../assets/images/tempItem.jpg");
const SCREEN_WIDTH = Dimensions.get("window").width;

const formatPhoneNumberForWhatsApp = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `+972${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith("972")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("+972") && cleaned.length >= 12) {
    return cleaned;
  }
  console.warn("Could not reliably format phone for WhatsApp:", phone);
  return null;
};

export default function MarketplaceItemScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { listingId } = params;
  const router = useRouter();
  const { settings } = useSettings();

  const [listingDetails, setListingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const useColumnLayout = settings.fontSizeMultiplier >= 2.0;

  const fetchDetails = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Listings/Details/${listingId}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            t("MarketplaceItemScreen_ErrorNotFound", { id: listingId })
          );
        }
        throw new Error(
          t("MarketplaceItemScreen_ErrorGenericFetch", {
            status: response.status,
          })
        );
      }
      const data = await response.json();
      setListingDetails(data);
    } catch (err) {
      setError(err.message);
      setListingDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [listingId, t]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      if (listingId) {
        fetchDetails();
      } else {
        setError("Listing ID is missing.");
        setIsLoading(false);
      }
    }, [listingId, fetchDetails])
  );

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          setCurrentUserId(storedUserID.replace(/"/g, ""));
        } else {
          setCurrentUserId(null);
        }
      } catch (e) {
        setCurrentUserId(null);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (listingDetails && currentUserId) {
      setIsOwner(String(listingDetails.sellerId) === String(currentUserId));
    } else {
      setIsOwner(false);
    }
  }, [listingDetails, currentUserId]);

  const handleImagePress = (imageUriToView, altText = "") => {
    if (!imageUriToView) return;
    router.push({
      pathname: "/ImageViewScreen",
      params: { imageUri: imageUriToView, altText: altText },
    });
  };

  const handleEditListing = () => {
    if (!listingDetails) return;
    router.push({
      pathname: "/MarketplaceNewItem",
      params: { mode: "edit", listingData: JSON.stringify(listingDetails) },
    });
  };

  const handleDeleteListing = async () => {
    if (!listingDetails) return;
    Alert.alert(
      t("MarketplaceItemScreen_DeleteConfirmTitle"),
      t("MarketplaceItemScreen_DeleteConfirmMsg"),
      [
        { text: t("Common_CancelButton"), style: "cancel" },
        {
          text: t("Common_DeleteButton"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await fetch(
                `${Globals.API_BASE_URL}/api/Listings/${listingDetails.listingId}`,
                { method: "DELETE" }
              );
              if (!response.ok) {
                let errorMsg = `HTTP error ${response.status}`;
                try {
                  const errData = await response.json();
                  errorMsg = errData.message || errorMsg;
                } catch {}
                throw new Error(errorMsg);
              }
              Toast.show({
                type: "success",
                text1: t("MarketplaceItemScreen_DeleteSuccessMsg"),
              });
              router.back();
            } catch (err) {
              Toast.show({
                type: "error",
                text1: t("MarketplaceItemScreen_DeleteErrorMsg"),
                text2: err.message,
              });
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleContactPress = (type) => {
    if (!listingDetails || !listingDetails.sellerId) return;
    let url = "";
    let contactValue = null;
    if (type === "email" && listingDetails.sellerEmail) {
      contactValue = listingDetails.sellerEmail;
      url = `mailto:${contactValue}`;
    } else if (type === "phone" && listingDetails.sellerPhone) {
      contactValue = listingDetails.sellerPhone;
      url = `tel:${contactValue}`;
    } else if (type === "whatsapp" && listingDetails.sellerPhone) {
      contactValue = formatPhoneNumberForWhatsApp(listingDetails.sellerPhone);
      if (contactValue) {
        url = `https://wa.me/${contactValue}`;
      } else {
        Alert.alert(
          t("MarketplaceItemScreen_CannotFormatWhatsAppTitle"),
          t("MarketplaceItemScreen_CannotFormatWhatsAppMsg")
        );
        return;
      }
    }
    if (!url || !contactValue) {
      Alert.alert(
        t("MarketplaceItemScreen_ContactNotAvailableTitle"),
        t("MarketplaceItemScreen_ContactNotAvailableMsg")
      );
      return;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            t("MarketplaceItemScreen_CannotHandleContactTitle"),
            t("MarketplaceItemScreen_CannotHandleContactMsg", { type: type })
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        Alert.alert(
          t("Common_Error"),
          t("MarketplaceItemScreen_ErrorOpeningLink")
        );
      });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <StyledText style={styles.loadingText}>
          {t("MarketplaceItemScreen_Loading")}
        </StyledText>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: "#fef1e6" }]}>
        <Header />
        <StyledText style={styles.errorText}>{error}</StyledText>
        <FlipButton
          onPress={() => router.back()}
          style={styles.backButton}
          bgColor="#f8f9fa"
          textColor="#343a40"
        >
          <StyledText style={styles.backButtonText}>
            {t("Common_BackButtonShort")}
          </StyledText>
        </FlipButton>
      </View>
    );
  }
  if (!listingDetails) {
    return (
      <View style={[styles.centered, { backgroundColor: "#fef1e6" }]}>
        <Header />
        <StyledText>{t("MarketplaceItemScreen_NoDetails")}</StyledText>
        <FlipButton
          onPress={() => router.back()}
          style={styles.backButton}
          bgColor="#f8f9fa"
          textColor="#343a40"
        >
          <StyledText style={styles.backButtonText}>
            {t("Common_BackButtonShort")}
          </StyledText>
        </FlipButton>
      </View>
    );
  }

  const mainImageUrl = listingDetails.mainPicture?.picPath
    ? `${Globals.API_BASE_URL}${listingDetails.mainPicture.picPath}`
    : null;
  const extraImageUrl = listingDetails.extraPicture?.picPath
    ? `${Globals.API_BASE_URL}${listingDetails.extraPicture.picPath}`
    : null;
  const mainImageSource = mainImageUrl
    ? { uri: mainImageUrl }
    : placeholderImage;
  const extraImageSource = extraImageUrl
    ? { uri: extraImageUrl }
    : placeholderImage;

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screenContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          <View style={styles.plaqueContainer}>
            <StyledText style={styles.title}>{listingDetails.title}</StyledText>
          </View>
          <StyledText style={styles.dateText}>
            {t("MarketplaceItemScreen_PublishedDate")}
            {new Date(listingDetails.date).toLocaleDateString("en-GB")}
          </StyledText>

          <View
            style={[styles.imageRowBase, useColumnLayout && styles.imageColumn]}
          >
            <TouchableOpacity
              onPress={() =>
                handleImagePress(
                  mainImageUrl,
                  listingDetails.mainPicture?.picAlt
                )
              }
              disabled={!mainImageUrl}
            >
              <Image
                source={mainImageSource}
                style={[styles.image, useColumnLayout && styles.largeImage]}
              />
              {!mainImageUrl && (
                <View style={styles.noImageOverlay}>
                  <StyledText style={styles.noImageText}>
                    {t("MarketplaceNewItemScreen_MainImage")}
                  </StyledText>
                </View>
              )}
            </TouchableOpacity>
            {(extraImageUrl || mainImageUrl) && (
              <TouchableOpacity
                onPress={() =>
                  handleImagePress(
                    extraImageUrl,
                    listingDetails.extraPicture?.picAlt
                  )
                }
                disabled={!extraImageUrl}
              >
                <Image
                  source={extraImageSource}
                  style={[
                    styles.image,
                    !extraImageUrl && styles.imagePlaceholder,
                    useColumnLayout && styles.largeImage,
                  ]}
                />
                {!extraImageUrl && (
                  <View style={styles.noImageOverlay}>
                    <StyledText style={styles.noImageText}>
                      {t("MarketplaceNewItemScreen_ExtraImage")}
                    </StyledText>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {listingDetails.description && (
            <View style={styles.section}>
              <StyledText style={styles.sectionTitle}>
                {t("MarketplaceItemScreen_DescriptionTitle")}
              </StyledText>
              <StyledText
                style={[
                  styles.descriptionText,
                  {
                    textAlign: /[\u0590-\u05FF]/.test(
                      listingDetails.description
                    )
                      ? "right"
                      : "left",
                  },
                ]}
              >
                {listingDetails.description}
              </StyledText>
            </View>
          )}

          <View style={styles.section}>
            <StyledText style={styles.sectionTitle}>
              {t("MarketplaceItemScreen_SellerTitle")}
            </StyledText>
            <StyledText style={styles.sellerText}>
              {listingDetails.sellerName}
            </StyledText>
            <View
              style={
                useColumnLayout
                  ? styles.contactContainerColumn
                  : styles.contactContainerRow
              }
            >
              {listingDetails.sellerEmail && (
                <FlipButton
                  style={styles.contactButton}
                  bgColor="#e0f0ff"
                  textColor="#007bff"
                  onPress={() => handleContactPress("email")}
                >
                  <Ionicons name="mail" size={24} color="#007bff" />
                  <StyledText style={styles.contactButtonText}>
                    {t("MarketplaceItemScreen_ContactEmail")}
                  </StyledText>
                </FlipButton>
              )}
              {listingDetails.sellerPhone && (
                <FlipButton
                  style={styles.contactButton}
                  bgColor="#d4edda"
                  textColor="#155724"
                  onPress={() => handleContactPress("phone")}
                >
                  <Ionicons name="call" size={24} color="#155724" />
                  <StyledText style={styles.contactButtonText}>
                    {t("MarketplaceItemScreen_ContactPhone")}
                  </StyledText>
                </FlipButton>
              )}
              {listingDetails.sellerPhone && (
                <FlipButton
                  style={styles.contactButton}
                  bgColor="#d1f8d1"
                  textColor="#1f9e44"
                  onPress={() => handleContactPress("whatsapp")}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#1f9e44" />
                  <StyledText style={styles.contactButtonText}>
                    {t("MarketplaceItemScreen_ContactWhatsApp")}
                  </StyledText>
                </FlipButton>
              )}
            </View>
            {!listingDetails.sellerEmail && !listingDetails.sellerPhone && (
              <StyledText style={styles.noContactText}>
                {t("MarketplaceItemScreen_NoContactInfo")}
              </StyledText>
            )}

            {isOwner && (
              <View style={styles.ownerActionsContainer}>
                <FlipButton
                  onPress={handleEditListing}
                  style={[styles.ownerButton, styles.editButton]}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <StyledText style={styles.ownerButtonText}>
                    {t("MarketplaceItemScreen_EditButton")}
                  </StyledText>
                </FlipButton>
                <FlipButton
                  onPress={handleDeleteListing}
                  style={[styles.ownerButton, styles.deleteButton]}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <StyledText style={styles.ownerButtonText}>
                    {t("MarketplaceItemScreen_DeleteButton")}
                  </StyledText>
                </FlipButton>
              </View>
            )}
          </View>

          <FlipButton
            onPress={() => router.back()}
            style={styles.backButton}
            bgColor="#f8f9fa"
            textColor="#343a40"
          >
            <StyledText style={styles.backButtonText}>
              {t("Common_BackButtonShort")}
            </StyledText>
          </FlipButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  plaqueContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 20,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 38,
    color: "#333",
  },
  dateText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  imageRowBase: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 30,
  },
  imageColumn: {
    flexDirection: "column",
    gap: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  largeImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
  },
  imagePlaceholder: {
    opacity: 0.5,
  },
  noImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(238, 238, 238, 0.8)",
    borderRadius: 10,
  },
  noImageText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    textAlign: "center",
    width: "100%",
    lineHeight: 28,
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#333",
    alignSelf: "stretch",
  },
  sellerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
    lineHeight: 26,
  },
  contactContainerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  contactContainerColumn: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    margin: 6,
    minWidth: 180,
    width: "90%",
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noContactText: {
    fontSize: 15,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignSelf: "center",
    width: "70%",
    maxWidth: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  backButtonText: {
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  errorText: {
    color: "red",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  ownerActionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  ownerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    width: "80%",
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  ownerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
