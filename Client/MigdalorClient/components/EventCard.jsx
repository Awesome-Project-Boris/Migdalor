import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const placeholderImage = require("../assets/images/EventsPlaceholder.png");

const EventCard = ({ event, onPress }) => {
  const { i18n, t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // This assumes participants count is fetched and passed into the event object.
  // For now, we'll simulate it as 0 if not present.
  const registeredCount = event.participantsCount || 0;
  const remainingSpots = event.capacity - registeredCount;

  const hostName = isRtl ? event.host?.hebrewName : event.host?.englishName;
  const imageUrl = placeholderImage;

  const cardDetailsStyle = [
    styles.cardDetails,
    { alignItems: isRtl ? "flex-end" : "flex-start" },
  ];
  const textStyle = [styles.baseText, { textAlign: isRtl ? "right" : "left" }];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={imageUrl} style={styles.cardImage} />
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
              <Ionicons name="people-outline" size={24} color="#555" />
              <Text style={[styles.registrationText, textStyle]}>
                {`${event.participantsCount} / ${event.capacity ?? "∞"} ${t(
                  "EventCard_Registered",
                  "Registered"
                )}`}
              </Text>
            </View>
            {/* --- NEW: Conditional text for available spots --- */}
            {remainingSpots > 0 && (
              <Text style={styles.spotsAvailableText}>
                {t("EventCard_SpacesAvailable", { count: remainingSpots })}
              </Text>
            )}
          </>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("EventCard_MoreDetails", "Click for more details")}
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
    // This will be overridden by inline styles but sets a default
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  icon: {
    marginRight: 6,
  },
  baseText: {
    fontSize: 16,
    color: "#666",
  },
  initiatorText: {
    fontWeight: "500",
  },
  registrationText: {
    color: "#005a9c",
    fontWeight: "bold",
  },
  spotsAvailableText: {
    fontSize: 14,
    color: "#28a745", // Green color to indicate availability
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
