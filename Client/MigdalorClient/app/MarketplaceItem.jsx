// frontend/MarketplaceItem.jsx

import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import Header from "@/components/Header";
import FlipButton from "@/components/FlipButton";
import { Ionicons } from "@expo/vector-icons"; // Import icons if you want for buttons
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import BouncyButton from "@/components/BouncyButton";

const placeholderImage = require("../assets/images/tempItem.jpg");

// Helper function to format phone number for WhatsApp
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

  useEffect(() => {
    // --- Fetching logic remains the same ---
    if (!listingId) {
      setError("Listing ID is missing.");
      setIsLoading(false);
      return;
    }
    const fetchDetails = async () => {
      setIsLoading(true);
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
    };
    fetchDetails();
  }, [listingId, t]);

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
        ); // Generic error for linking
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
          style={styles.backButton} // Reuse back button style
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
          style={styles.backButton} // Reuse back button style
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
            {t("MarketplaceItemScreen_PublishedDate")}{" "}
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
                  // this tiny object gets merged _after_ the static styles:
                  {
                    textAlign: /[\u0590-\u05FF]/.test(listingDetails.description)
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
                  textColor="#1f9e44" // Slightly darker green for text on light green bg
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
          </View>

          {/* Refactored Back Button */}
          <FlipButton
            text={t("Common_BackButtonShort")} // Use text prop
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

// --- Styles ---
// --- Styles for MarketplaceItem.jsx ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    marginTop: 70, // Adjust if header height changes
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 15, // Add horizontal padding to scroll view content
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    paddingVertical: 20, // Add vertical padding inside the main content block
  },
  title: {
    fontSize: 30, // Bigger
    fontWeight: "bold",
    marginBottom: 8, // Adjusted
    textAlign: "center",
  },
  dateText: {
    fontSize: 15, // Bigger
    color: "#666",
    textAlign: "center",
    marginBottom: 25, // More space
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center", // Align items vertically if heights differ
    marginBottom: 30, // More space
  },
  image: {
    width: 150, // Fixed size or use percentage
    height: 150,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePlaceholder: {
    opacity: 0.5,
    backgroundColor: "#eee",
    justifyContent: "center", // Center placeholder text
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
    fontSize: 16, // Bigger
  },
  section: {
    marginBottom: 30, // More space between sections
    padding: 20, // More padding inside sections
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center", // Center content within sections
  },
  sectionTitle: {
    fontSize: 22, // Bigger
    fontWeight: "bold",
    marginBottom: 15, // More space
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8, // Adjusted
    textAlign: "center", // Center section titles
    width: "100%", // Make title take width for border
  },
  descriptionText: {
    fontSize: 17, // Bigger
    lineHeight: 26, // Bigger line height
    color: "#333",
    //textAlign: "left", // Keep description left-aligned
    alignSelf: "stretch", // Allow text to take full width of section padding
  },
  sellerText: {
    // Seller Name Style
    fontSize: 20, // Bigger
    fontWeight: "bold", // Bolder
    marginBottom: 20, // More space below name
    color: "#333",
    textAlign: "center", // Centered
  },
  contactColumn: {
    // Container for vertical buttons
    alignItems: "center", // Center buttons horizontally in the column
    marginTop: 10,
    width: "100%", // Take full width of parent section
    justifyContent: "center",
  },
  contactButton: {
    // Style for the button container (FlipButton)
    // Note: Text styling is now handled inside FlipButton via textBase + textColor prop
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    width: SCREEN_WIDTH * 0.75, // Buttons take 75% of screen width
    maxWidth: 350,
    marginVertical: 8, // Vertical space between buttons
  },
  emailButton: { backgroundColor: "#e0f0ff", borderColor: "#a0c8ff" },
  phoneButton: { backgroundColor: "#d4edda", borderColor: "#a3d1a4" },
  whatsappButton: { backgroundColor: "#d1f8d1", borderColor: "#9ae6b4" },
  // Removed contactButtonText style definition
  noContactText: {
    fontSize: 15, // Bigger
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 15,
  },
  backButton: {
    // Style for the main back button container (FlipButton)
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignSelf: "center",
    width: "70%", // Wider
    maxWidth: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  // Removed backButtonText style definition
  loadingText: {
    // Style for loading text
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
});
