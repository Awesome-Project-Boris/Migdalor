import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { Globals } from "@/app/constants/Globals";

const placeholderImage = require("../assets/images/EventsPlaceholder.png");

const EventCard = ({ event, onPress }) => {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const registeredCount = event.participantsCount || 0;
  const remainingSpots = event.capacity - registeredCount;

  const hostName = isRtl ? event.host?.hebrewName : event.host?.englishName;

  // ✅ CHANGED: Logic to determine the image source
  const imageUrl = event.picturePath
    ? { uri: `${Globals.API_BASE_URL}${event.picturePath}` }
    : placeholderImage;

  const cardDetailsStyle = [
    styles.cardDetails,
    { alignItems: isRtl ? "flex-end" : "flex-start" },
  ];
  const textStyle = [styles.baseText, { textAlign: isRtl ? "right" : "left" }];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ExpoImage
        source={imageUrl}
        style={styles.cardImage}
        contentFit="cover"
      />
      <View style={cardDetailsStyle}>
        <Text style={[styles.cardTitle, textStyle]}>{event.eventName}</Text>

        {hostName && (
          <View
            style={[
              styles.metaRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Ionicons name="person-outline" size={16} color="#555" />
            <Text style={[styles.initiatorText, textStyle]}>{hostName}</Text>
          </View>
        )}

        {!event.isRecurring && (
          <>
            <View
              style={[
                styles.metaRow,
                { flexDirection: isRtl ? "row-reverse" : "row" },
              ]}
            >
              <Ionicons name="people-outline" size={16} color="#555" />
              <Text style={[styles.registrationText, textStyle]}>
                {`${registeredCount} / ${event.capacity ?? "∞"} ${t(
                  "EventCard_Registered"
                )}`}
              </Text>
            </View>
            {remainingSpots > 0 && event.capacity !== null && (
              <Text style={styles.spotsAvailableText}>
                {t("EventCard_SpacesAvailable", { count: remainingSpots })}
              </Text>
            )}
          </>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("EventCard_MoreDetails")}</Text>
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
  },
  cardDetails: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  baseText: {
    fontSize: 16,
    color: "#666",
  },
  initiatorText: {
    fontWeight: "500",
    marginLeft: 6,
    marginRight: 6,
  },
  registrationText: {
    color: "#005a9c",
    fontWeight: "bold",
    marginLeft: 6,
    marginRight: 6,
  },
  spotsAvailableText: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "600",
    marginTop: 8,
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
});

export default EventCard;
