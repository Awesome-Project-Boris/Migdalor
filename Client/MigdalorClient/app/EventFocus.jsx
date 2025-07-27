import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import AttendanceDrawer from "@/components/AttendanceDrawer";
import FlipButton from "@/components/FlipButton";
import Header from "@/components/Header";
import { Image as ExpoImage } from "expo-image";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext.jsx";

const placeholderImage = require("../assets/images/EventsPlaceholder.png");

const formatRecurrenceDays = (rule, t) => {
  if (!rule) return null;

  const byDayPart = rule.split(";").find((part) => part.startsWith("BYDAY="));
  if (!byDayPart) return null;

  const dayCodes = byDayPart.split("=")[1].split(",");
  const dayMap = {
    SU: t("Days_Sunday", "Sunday"),
    MO: t("Days_Monday", "Monday"),
    TU: t("Days_Tuesday", "Tuesday"),
    WE: t("Days_Wednesday", "Wednesday"),
    TH: t("Days_Thursday", "Thursday"),
    FR: t("Days_Friday", "Friday"),
    SA: t("Days_Saturday", "Saturday"),
  };

  return dayCodes.map((code) => dayMap[code] || code).join(", ");
};

// --- FIX START ---
// The formatTime and formatDate functions have been updated to use string manipulation.
// This prevents the `new Date()` constructor from incorrectly converting the UTC time
// from the server into the local device time.

/**
 * Formats an ISO date-time string to show only the time (HH:mm).
 * @param {string} dateString - The ISO date string (e.g., "2025-07-25T15:15:00Z").
 * @returns {string} The formatted time (e.g., "15:15").
 */
const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    // Extracts the time part (e.g., "15:15") from the string.
    const timePart = dateString.split("T")[1];
    const timeParts = timePart.split(":");
    return `${timeParts[0]}:${timeParts[1]}`;
  } catch (e) {
    console.error("Error formatting time string:", e);
    return ""; // Fallback to an empty string on error.
  }
};

/**
 * Formats an ISO date-time string to show only the date (dd/MM/yyyy).
 * @param {string} dateString - The ISO date string (e.g., "2025-07-25T15:15:00Z").
 * @returns {string} The formatted date (e.g., "25/07/2025").
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    // Extracts the date part and reformats it from yyyy-MM-dd to dd/MM/yyyy.
    const datePart = dateString.split("T")[0];
    const dateParts = datePart.split("-");
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  } catch (e) {
    console.error("Error formatting date string:", e);
    return "";
  }
};
// --- FIX END ---

export default function EventFocusScreen() {
  const { eventId: eventIdFromParams } = useLocalSearchParams();
  const [eventId, setEventId] = useState(null);
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { settings } = useSettings();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    if (eventIdFromParams) {
      const numericEventId = parseInt(eventIdFromParams, 10);
      if (!isNaN(numericEventId)) {
        setEventId(numericEventId);
      }
    }
  }, [eventIdFromParams]);

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      const storedUserID = await AsyncStorage.getItem("userID");
      if (storedUserID) {
        setCurrentUserId(storedUserID.replace(/"/g, ""));
      } else {
        setError(
          t(
            "Errors_Auth_NoUser",
            "Could not identify the current user. Please log in again."
          )
        );
        setIsLoading(false);
      }
    };
    getUserIdFromStorage();
  }, [t]);

  const handleFinalizeToggle = (participationChecked) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      participationChecked: participationChecked,
    }));
  };

  const fetchData = useCallback(async () => {
    if (!eventId || !currentUserId) return;

    setIsLoading(true);
    try {
      const [eventResponse, participantsResponse] = await Promise.all([
        fetch(`${Globals.API_BASE_URL}/api/events/${eventId}`),
        fetch(`${Globals.API_BASE_URL}/api/events/${eventId}/participants`),
      ]);

      if (!eventResponse.ok)
        throw new Error(
          t("Errors_Event_Fetch", "Could not fetch event details.")
        );

      const eventData = await eventResponse.json();

      console.log(eventData);

      setEvent(eventData);

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setParticipants(participantsData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, currentUserId, t]);

  useEffect(() => {
    if (currentUserId && eventId) {
      fetchData();
    }
  }, [fetchData, currentUserId, eventId]);

  const handleRegister = () => {
    Alert.alert(
      t("EventFocus_ConfirmRegistrationTitle", "Confirm Registration"),
      t(
        "EventFocus_ConfirmRegistrationMsg",
        "Do you want to register for this activity?"
      ),
      [
        { text: t("Common_Cancel", "Cancel"), style: "cancel" },
        {
          text: t("Common_Register", "Register"),
          onPress: async () => {
            try {
              const authToken = await AsyncStorage.getItem("jwt");
              const response = await fetch(
                `${Globals.API_BASE_URL}/api/events/register`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: JSON.stringify({
                    eventId: event.eventId,
                    participantId: currentUserId,
                  }),
                }
              );
              const result = await response.text();
              if (!response.ok) throw new Error(result);
              Alert.alert(
                t("Common_Success", "Success"),
                t("EventFocus_RegistrationSuccess", "You have been registered!")
              );
              fetchData();
            } catch (err) {
              Alert.alert(t("Common_Error", "Error"), err.message);
            }
          },
        },
      ]
    );
  };

  const handleHostPress = () => {
    if (!event?.host?.hostId || event.host.role?.toLowerCase() === "admin")
      return;
    const pathname = event.isRecurring ? "/InstructorProfile" : "/Profile";
    router.push({
      pathname,
      params: { userId: event.host.hostId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <StyledText style={styles.errorText}>{error}</StyledText>
      </View>
    );
  }
  if (!event) {
    return (
      <View style={styles.centered}>
        <StyledText>{t("Common_NotFound", "Event not found.")}</StyledText>
      </View>
    );
  }

  const isCreator = currentUserId === event.host?.hostId;
  const isRegistered = participants.some(
    (p) => p.participantId === currentUserId
  );
  const isFull =
    event.capacity !== null && participants.length >= event.capacity;

  const canMarkAttendance =
    new Date(event.startDate.slice(0, -1)) <= new Date();
  const hostName = isRtl ? event.host?.hebrewName : event.host?.englishName;
  const startTime = formatTime(event.startDate);
  const endTime = formatTime(event.endDate);
  const displayDate = formatDate(event.startDate);
  const remainingSpots =
    event.capacity !== null ? event.capacity - participants.length : Infinity;
  const imageUrl = event.picturePath
    ? { uri: `${Globals.API_BASE_URL}${event.picturePath}` }
    : placeholderImage;

  const isEventOver = new Date() > new Date(event.endDate);

  const recurrenceDayString = formatRecurrenceDays(event.recurrenceRule, t);

  const isLargeFont = settings.fontSizeMultiplier >= 2;

  const DetailRow = ({
    icon,
    label,
    value,
    onPress,
    isLink,
    isLast = false,
  }) => {
    if (isLargeFont) {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={!onPress}
          style={[styles.detailColumn(isLast)]}
        >
          <View
            style={[
              styles.detailHeader,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Ionicons
              name={icon}
              size={24 * settings.fontSizeMultiplier}
              color="#8c7a6b"
              style={isRtl ? styles.iconRtl : styles.iconLtr}
            />
            <StyledText style={styles.detailLabel}>{label}:</StyledText>
          </View>
          <StyledText
            style={[
              styles.detailValue,
              isLink && styles.linkText,
              styles.detailValueColumn,
              { textAlign: isRtl ? "right" : "left" },
            ]}
          >
            {value}
          </StyledText>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.detailRow(isLast),
          { flexDirection: isRtl ? "row-reverse" : "row" },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color="#8c7a6b"
          style={isRtl ? styles.iconRtl : styles.iconLtr}
        />
        <StyledText style={styles.detailLabel}>{label}:</StyledText>
        <StyledText
          style={[
            styles.detailValue,
            isLink && styles.linkText,
            { textAlign: isRtl ? "left" : "right" },
          ]}
        >
          {value}
        </StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fef1e6" }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ExpoImage source={imageUrl} style={styles.image} contentFit="cover" />
        <StyledText style={[styles.title, { textAlign: "center" }]}>
          {event.eventName}
        </StyledText>
        <StyledText style={[styles.description, { textAlign: "center" }]}>
          {event.description}
        </StyledText>

        <View style={styles.detailsContainer}>
          {event.isRecurring && recurrenceDayString && (
            <DetailRow
              icon="repeat-outline"
              label={t("EventFocus_RecurrenceDay", "Day")}
              value={recurrenceDayString}
            />
          )}

          {!event.isRecurring && (
            <DetailRow
              icon="calendar-outline"
              label={t("EventFocus_Date", "Date")}
              value={displayDate}
            />
          )}
          <DetailRow
            icon="time-outline"
            label={t("EventFocus_Time", "Time")}
            value={`${startTime} - ${endTime}`}
          />
          <DetailRow
            icon="location-outline"
            label={t("EventFocus_Location", "Location")}
            value={event.location}
          />
          {hostName && (
            <DetailRow
              icon="person-outline"
              label={t("EventFocus_Host", "Host")}
              value={hostName}
              onPress={handleHostPress}
              isLink={
                !!event.host?.hostId &&
                event.host.role?.toLowerCase() !== "admin"
              }
              isLast={event.isRecurring}
            />
          )}
          {!event.isRecurring && (
            <DetailRow
              icon="people-outline"
              label={t("EventFocus_Capacity", "Capacity")}
              value={
                event.capacity !== null
                  ? `${participants.length} / ${event.capacity}`
                  : t("EventFocus_Unlimited", "Unlimited")
              }
              isLast={true}
            />
          )}
        </View>

        {!event.isRecurring && (
          <View style={styles.actionContainer}>
            {isCreator ? (
              <AttendanceDrawer
                eventId={eventId}
                participants={participants}
                canMarkAttendance={canMarkAttendance}
                isFinalized={event.participationChecked}
                onStateChange={handleFinalizeToggle}
              />
            ) : (
              <>
                {/* ✅ The 'Spots Available' text is now hidden if the event is over */}
                {!isEventOver &&
                  remainingSpots > 0 &&
                  event.capacity !== null && (
                    <StyledText style={styles.spotsAvailableText}>
                      {t("EventFocus_SpacesAvailable", {
                        count: remainingSpots,
                      })}
                    </StyledText>
                  )}

                {isRegistered ? (
                  <View style={styles.statusContainer}>
                    <StyledText style={styles.statusText}>
                      {t("EventFocus_YouAreRegistered", "You are registered!")}
                    </StyledText>
                  </View>
                ) : isFull ? (
                  <View
                    style={[
                      styles.statusContainer,
                      { backgroundColor: "#f8d7da" },
                    ]}
                  >
                    <StyledText style={[styles.statusText, styles.fullText]}>
                      {t("EventFocus_ActivityFull", "This activity is full.")}
                    </StyledText>
                  </View>
                ) : !isEventOver ? ( // ✅ The 'Register' button is now hidden if the event is over
                  <FlipButton
                    onPress={handleRegister}
                    style={styles.registerButton}
                    bgColor="#007bff"
                    textColor="#ffffff"
                  >
                    <StyledText style={styles.buttonText}>
                      {t("Common_Register", "Register")}
                    </StyledText>
                  </FlipButton>
                ) : null}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef1e6",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#fff8f0",
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0c4a2",
  },
  detailRow: (isLast = false) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: "#f5eadd",
  }),
  detailColumn: (isLast = false) => ({
    flexDirection: "column",
    paddingVertical: 12,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: "#f5eadd",
  }),
  detailHeader: {
    alignItems: "center",
    marginBottom: 6,
  },
  detailValueColumn: {
    paddingHorizontal: 8,
  },
  iconLtr: {
    marginRight: 15,
    color: "#8c7a6b",
  },
  iconRtl: {
    marginLeft: 15,
    color: "#8c7a6b",
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5c4b33",
    alignSelf: "center",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    alignSelf: "center",
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  actionContainer: {
    width: "100%",
    marginTop: 10,
    paddingBottom: 30,
  },
  registerButton: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusContainer: {
    width: "100%",
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#e9f5ec",
  },
  statusText: {
    textAlign: "center",
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
  },
  fullText: {
    color: "#721c24",
  },
  spotsAvailableText: {
    fontSize: 17,
    color: "#28a745",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
});
