import React from "react";
import { StyleSheet, View, Image } from "react-native"; // Text import removed
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH, Globals } from "../app/constants/Globals";
import BouncyButton from "@/components/BouncyButton";
import StyledText from "@/components/StyledText.jsx"; // Import StyledText

const placeholderImage = require("../assets/images/tempItem.jpg");

export default function MarketplaceItemCard({ data, onPress }) {
  const { t } = useTranslation();

  // Construct the full image URL if mainImagePath exists, otherwise use placeholder
  const imageUrl = data?.mainImagePath
    ? { uri: `${Globals.API_BASE_URL}${data.mainImagePath}` }
    : placeholderImage;

  return (
    <BouncyButton onPress={onPress} style={styles.container}>
      <Image
        style={styles.image}
        source={imageUrl}
        onError={(e) =>
          console.log(
            `Error loading image ${imageUrl.uri || "placeholder"}:`,
            e.nativeEvent.error
          )
        }
      />

      <View style={styles.infoContainer}>
        {/* Replaced Text with StyledText */}
        <StyledText style={styles.itemName} numberOfLines={2}>
          {data?.title || t("MarketplaceItemCard_Untitled")}
        </StyledText>
        {/* Replaced Text with StyledText */}
        <StyledText style={styles.sellerName}>
          {data?.sellerName || t("MarketplaceItemCard_UnknownSeller")}
        </StyledText>
      </View>

      <View style={styles.moreInfoContainer}>
        {/* Replaced Text with StyledText */}
        <StyledText style={styles.moreInfoText}>
          {t("MarketplaceScreen_MoreDetailsButton")}
        </StyledText>
      </View>
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 8,
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
    flex: 1,
    justifyContent: "center",
    height: "100%",
    paddingRight: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  moreInfoContainer: {
    position: "absolute",
    bottom: 8,
    left: 135,
    right: 10,
    alignItems: "flex-start",
  },
  moreInfoText: {
    fontSize: 12,
    color: "#999",
  },
});