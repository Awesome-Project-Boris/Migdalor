import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import BouncyButton from "@/components/BouncyButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";

const placeholderImage = require("../assets/images/tempItem.jpg");

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

  const [listingDetails, setListingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchDetails = useCallback(async () => {
    setError(null);
    console.log(`Fetching details for listing ID: ${listingId}...`);
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
      console.log("Fetched details:", data);
      setListingDetails(data);
    } catch (err) {
      console.error("Failed to fetch listing details:", err);
      setError(err.message);
      setListingDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [listingId, t]);

  useFocusEffect(
    useCallback(() => {
      console.log("MarketplaceItemScreen focused, fetching details...");

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
          console.log(
            "MarketplaceItemScreen: Fetched UserID from AsyncStorage:",
            storedUserID
          );
          setCurrentUserId(storedUserID);
        } else {
          console.warn(
            "MarketplaceItemScreen: UserID not found in AsyncStorage."
          );
          setCurrentUserId(null);
        }
      } catch (e) {
        console.error(
          "MarketplaceItemScreen: Failed to fetch userID from storage",
          e
        );
        setCurrentUserId(null);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (listingDetails && currentUserId) {
      console.log(
        `Comparing UserID (${currentUserId}) with SellerID (${listingDetails.sellerId})`
      );

      setIsOwner(
        String(listingDetails.sellerId).toLowerCase() ===
          String(currentUserId).toLowerCase()
      );
    } else {
      setIsOwner(false);
    }
  }, [listingDetails, currentUserId]);

  const handleImagePress = (imageUriToView, altText = "") => {
    if (!imageUriToView) {
      console.log("handleImagePress: No valid imageUri provided.");
      return;
    }

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

  const handleEditListing = () => {
    if (!listingDetails) return;
    console.log("Navigating to Edit with data:", listingDetails);
    router.push({
      pathname: "/MarketplaceNewItem",
      params: {
        mode: "edit",
        listingData: JSON.stringify(listingDetails),
      },
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
            console.log(
              `Attempting to delete listing ID: ${listingDetails.listingId}`
            );

            try {
              setIsLoading(true);
              const response = await fetch(
                `${Globals.API_BASE_URL}/api/Listings/${listingDetails.listingId}`,
                {
                  method: "DELETE",
                }
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
              console.error("Failed to delete listing:", err);
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
          console.warn(`Cannot handle URL type: ${type} with URL: ${url}`);
          Alert.alert(
            t("MarketplaceItemScreen_CannotHandleContactTitle"),
            t("MarketplaceItemScreen_CannotHandleContactMsg", { type: type })
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error(
          `An error occurred trying to open ${type} link: ${url}`,
          err
        );
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
        <Text style={styles.loadingText}>
          {t("MarketplaceItemScreen_Loading")}
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Header />
        <Text style={styles.errorText}>{error}</Text>
        <FlipButton
          onPress={() => router.back()}
          style={styles.backButton}
          bgColor="#f8f9fa"
          textColor="#343a40"
        >
          <Text style={styles.backButtonText}>
            {t("Common_BackButtonShort")}
          </Text>
        </FlipButton>
      </View>
    );
  }
  if (!listingDetails) {
    return (
      <View style={styles.centered}>
        <Header />
        <Text>{t("MarketplaceItemScreen_NoDetails")}</Text>
        <FlipButton
          onPress={() => router.back()}
          style={styles.backButton}
          bgColor="#f8f9fa"
          textColor="#343a40"
        >
          <Text style={styles.backButtonText}>
            {t("Common_BackButtonShort")}
          </Text>
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
          {/* Title, Date ... */}
          <Text style={styles.title}>{listingDetails.title}</Text>
          <Text style={styles.dateText}>
            {t("MarketplaceItemScreen_PublishedDate")}
            {new Date(listingDetails.date).toLocaleDateString("en-GB")}
          </Text>

          {/* Images ... */}
          <View style={styles.imageRow}>
            {/* Image rendering remains the same */}
            <TouchableOpacity
              onPress={() =>
                handleImagePress(
                  mainImageUrl,
                  listingDetails.mainPicture?.picAlt
                )
              }
              disabled={!mainImageUrl}
            >
              <Image source={mainImageSource} style={styles.image} />
              {!mainImageUrl && (
                <Text style={styles.noImageText}>
                  {t("MarketplaceNewItemScreen_MainImage")}
                </Text>
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
                  ]}
                />
                {!extraImageUrl && (
                  <Text style={styles.noImageText}>
                    {t("MarketplaceNewItemScreen_ExtraImage")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Description ... */}
          {listingDetails.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("MarketplaceItemScreen_DescriptionTitle")}
              </Text>
              <Text
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
              </Text>
            </View>
          )}

          {/* Seller Info & Contact Buttons... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("MarketplaceItemScreen_SellerTitle")}
            </Text>
            <Text style={styles.sellerText}>{listingDetails.sellerName}</Text>
            <View style={styles.contactColumn}>
              {/* Refactored Buttons to use text prop */}
              {listingDetails.sellerEmail && (
                <FlipButton
                  style={[styles.contactButton, styles.emailButton]}
                  onPress={() => handleContactPress("email")}
                  bgColor="#e0f0ff"
                  textColor="#007bff"
                >
                  <Ionicons
                    name="mail"
                    size={28}
                    color="#007bff"
                    style={styles.icon}
                  />
                  <Text>{t("MarketplaceItemScreen_ContactEmail")}</Text>
                </FlipButton>
              )}
              {listingDetails.sellerPhone && (
                <FlipButton
                  style={[styles.contactButton, styles.phoneButton]}
                  onPress={() => handleContactPress("phone")}
                  bgColor="#d4edda"
                  textColor="#155724"
                >
                  <Ionicons
                    name="home"
                    size={28}
                    color="#155724"
                    style={styles.icon}
                  />
                  <Text>{t("MarketplaceItemScreen_ContactPhone")}</Text>
                </FlipButton>
              )}
              {listingDetails.sellerPhone && (
                <FlipButton
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={() => handleContactPress("whatsapp")}
                  bgColor="#d1f8d1"
                  textColor="#1f9e44"
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={28}
                    color="#1f9e44"
                    style={styles.icon}
                  />
                  <Text>{t("MarketplaceItemScreen_ContactWhatsApp")}</Text>
                </FlipButton>
              )}
            </View>
            {!listingDetails.sellerEmail && !listingDetails.sellerPhone && (
              <Text style={styles.noContactText}>
                {t("MarketplaceItemScreen_NoContactInfo")}
              </Text>
            )}

            {isOwner && (
              <View style={styles.ownerActionsContainer}>
                <FlipButton
                  onPress={handleEditListing}
                  style={[styles.ownerButton, styles.editButton]}
                  bgColor="#28a745"
                  textColor="#fff"
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color="#fff"
                    style={styles.ownerIcon}
                  />
                  <Text style={styles.ownerButtonText}>
                    {t("MarketplaceItemScreen_EditButton")}
                  </Text>
                </FlipButton>
                <FlipButton
                  onPress={handleDeleteListing}
                  style={[styles.ownerButton, styles.deleteButton]}
                  bgColor="#dc3545"
                  textColor="#fff"
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#fff"
                    style={styles.ownerIcon}
                  />
                  <Text style={styles.ownerButtonText}>
                    {t("MarketplaceItemScreen_DeleteButton")}
                  </Text>
                </FlipButton>
              </View>
            )}
          </View>

          {/* Refactored Back Button */}
          <FlipButton
            text={t("Common_BackButtonShort")}
            onPress={() => router.back()}
            style={styles.backButton}
            bgColor="#f8f9fa"
            textColor="#343a40"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    marginTop: 70,
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  dateText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePlaceholder: {
    opacity: 0.5,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#888",
    fontWeight: "bold",
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
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
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#333",
    //textAlign: "left",
    alignSelf: "stretch",
  },
  sellerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  contactColumn: {
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  contactButton: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 350,
    marginVertical: 8,
  },
  emailButton: { backgroundColor: "#e0f0ff", borderColor: "#a0c8ff" },
  phoneButton: { backgroundColor: "#d4edda", borderColor: "#a3d1a4" },
  whatsappButton: { backgroundColor: "#d1f8d1", borderColor: "#9ae6b4" },

  noContactText: {
    fontSize: 15,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 15,
  },
  backButton: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignSelf: "center",
    width: "70%",
    maxWidth: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
  },
  ownerActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  ownerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    width: "45%",
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: "#28a745",
    borderColor: "#1c7430",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderColor: "#b02a37",
  },
  ownerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ownerIcon: {
    marginRight: 8,
  },
});
