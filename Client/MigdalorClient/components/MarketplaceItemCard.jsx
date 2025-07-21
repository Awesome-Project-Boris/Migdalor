import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";
import BouncyButton from "@/components/BouncyButton";
import StyledText from "@/components/StyledText.jsx";

const placeholderImage = require("../assets/images/tempItem.jpg");

// --- MODIFIED: Accept the new 'isNew' prop ---
export default function MarketplaceItemCard({ data, onPress, isNew }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const imageUrl = data?.mainImagePath
    ? { uri: `${Globals.API_BASE_URL}${data.mainImagePath}` }
    : placeholderImage;

  return (
    <BouncyButton onPress={onPress} style={styles.container}>
      <Image
        style={styles.image}
        source={imageUrl}
        onError={(e) =>
          console.log("Error loading image:", e.nativeEvent.error)
        }
      />
      <View style={styles.infoContainer}>
        <StyledText style={styles.itemName} numberOfLines={3}>
          {data?.title || t("MarketplaceItemCard_Untitled")}
        </StyledText>
        <StyledText style={styles.sellerName} numberOfLines={2}>
          {data?.sellerName || t("MarketplaceItemCard_UnknownSeller")}
        </StyledText>
        <StyledText style={styles.moreInfoText}>
          {t("MarketplaceScreen_MoreDetailsButton")}
        </StyledText>
      </View>

      {/* --- ADDED: The "New" badge, only appears if isNew is true --- */}
      {isNew && (
        <View
          style={[
            styles.newBadge,
            isRtl ? styles.newBadgeRtl : styles.newBadgeLtr,
          ]}
        >
          <StyledText style={styles.newBadgeText}>
            {t("Item_New", "New")}
          </StyledText>
        </View>
      )}
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%", // Card takes full width of its wrapper
    minHeight: 150,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "#e0e0e0",
  },
  infoContainer: {
    flex: 1, // This is crucial: allows the info to take up remaining space
    justifyContent: "space-around", // Distributes space evenly
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 24,
  },
  sellerName: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  moreInfoText: {
    fontSize: 12,
    color: "#999",
    lineHeight: 16,
  },
  newBadge: {
    position: "absolute",
    top: 10,
    backgroundColor: "#ff4757",
    borderRadius: 5,
    paddingHorizontal: 10, // Increased padding
    paddingVertical: 5,
    elevation: 5,
  },
  newBadgeLtr: {
    right: 10, // Position on the right for LTR
  },
  newBadgeRtl: {
    left: 10, // Position on the left for RTL
  },
  newBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14, // Increased font size
  },
});
