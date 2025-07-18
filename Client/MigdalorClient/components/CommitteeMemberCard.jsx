// components/CommitteeMemberCard.jsx
import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText"; // Import StyledText

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_IMAGE_WIDTH = SCREEN_WIDTH * 0.7;

function CommitteeMemberCard({ data }) {
  const { t } = useTranslation();
  const placeholderImage = require("../assets/images/tempItem.jpg");
  const imageUrl = data?.photoUrl ? { uri: data.photoUrl } : placeholderImage;

  return (
    <View style={styles.cardContainer}>
      <Image source={imageUrl} style={styles.photo} resizeMode="cover" />
      {/* Replaced Text with StyledText */}
      <StyledText style={styles.name}>
        {data?.name || t("ResidentsCommitte_nameUnavailable")}
      </StyledText>
      {/* Replaced Text with StyledText */}
      <StyledText style={styles.title}>
        {data?.title || t("ResidentsCommitte_titleUnavailable")}
      </StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
    padding: 10,
  },
  photo: {
    width: CARD_IMAGE_WIDTH,
    height: CARD_IMAGE_WIDTH * (4 / 4),
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});

export default CommitteeMemberCard;
