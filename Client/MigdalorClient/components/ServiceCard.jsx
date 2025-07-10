import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";

const placeholderImage = require("../assets/images/ServicesPlaceholder.png");

const ServiceCard = ({ service, onPress }) => {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // --- FIX: Use camelCase properties ---
  const name = isRtl ? service.hebrewName : service.englishName;
  const description = isRtl
    ? service.hebrewDescription
    : service.englishDescription;

  const getImageUrl = () => {
    // The data provides pictureID, not a path. We'll need a way to resolve this.
    // For now, we continue using the placeholder.
    if (service.picturePath) {
      // Assuming a future 'picturePath' property
      return { uri: `${Globals.API_BASE_URL}${service.picturePath}` };
    }
    return placeholderImage;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={getImageUrl()} style={styles.cardImage} />
      <View style={styles.detailsContainer}>
        <Text style={[styles.cardTitle, isRtl && styles.rtlText]}>{name}</Text>
        {description && (
          <Text style={[styles.cardDescription, isRtl && styles.rtlText]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("Services_Click_For_Details", "Click for details")}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  footerText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  rtlText: {
    writingDirection: "rtl",
    textAlign: "right",
  },
});

export default ServiceCard;
