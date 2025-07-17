import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { Globals } from "@/app/constants/Globals";
import StyledText from "@/components/StyledText"; // Import StyledText

const placeholderImage = require("../assets/images/EventsPlaceholder.png");

const EventCard = ({ event, onPress }) => {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const registeredCount = event.participantsCount || 0;
  const remainingSpots = event.capacity - registeredCount;

  const hostName = isRtl ? event.host?.hebrewName : event.host?.englishName;

  const imageUrl = event.picturePath
    ? { uri: `${Globals.API_BASE_URL}${event.picturePath}` }
    : placeholderImage;

  const cardDetailsStyle = [
    styles.cardDetails,
    { alignItems: isRtl ? "flex-end" : "flex-start" },
  ];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ExpoImage
        source={imageUrl}
        style={styles.cardImage}
        contentFit="cover"
      />
      <View style={cardDetailsStyle}>
        <StyledText style={styles.cardTitle}>{event.eventName}</StyledText>

        {hostName && (
          <View
            style={[
              styles.metaRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Ionicons name="person-outline" size={16} color="#555" />
            <StyledText style={styles.initiatorText}>{hostName}</StyledText>
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
              <StyledText style={styles.registrationText}>
                {`${registeredCount} / ${event.capacity ?? "∞"} ${t(
                  "EventCard_Registered"
                )}`}
              </StyledText>
            </View>
            {remainingSpots > 0 && event.capacity !== null && (
              <StyledText style={styles.spotsAvailableText}>
                {t("EventCard_SpacesAvailable", { count: remainingSpots })}
              </StyledText>
            )}
          </>
        )}
      </View>
      <View style={styles.footer}>
        <StyledText style={styles.footerText}>
          {t("EventCard_MoreDetails")}
        </StyledText>
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
  initiatorText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginLeft: 6,
    marginRight: 6,
  },
  registrationText: {
    fontSize: 16,
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
