import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals";
import BouncyButton from "@/components/BouncyButton";
import StyledText from "@/components/StyledText.jsx";

const placeholderImage = require("../assets/images/tempItem.jpg");

export default function MarketplaceItemCard({ data, onPress }) {
  const { t } = useTranslation();

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
});
