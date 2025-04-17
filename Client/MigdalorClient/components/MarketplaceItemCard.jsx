import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH, Globals } from "../app/constants/Globals";

const placeholderImage = require("../assets/images/tempItem.jpg");

export default function MarketplaceItemCard({ data, onPress }) {
  const { t } = useTranslation();

  // Animated value for press shrink effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const imageUrl = data?.mainImagePath
    ? { uri: `${Globals.API_BASE_URL}${data.mainImagePath}` }
    : placeholderImage;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      >
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
          <Text style={styles.itemName} numberOfLines={2}>
            {data?.title || t("MarketplaceItemCard_Untitled")}
          </Text>
          <Text style={styles.sellerName}>
            {data?.sellerName || t("MarketplaceItemCard_UnknownSeller")}
          </Text>
        </View>

        <View style={styles.moreInfoContainer}>
          <Text style={styles.moreInfoText}>
            {t("MarketplaceScreen_MoreDetailsButton")}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
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
