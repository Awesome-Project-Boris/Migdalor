import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globals } from "@/app/constants/Globals";
import AttendanceDrawer from "@/components/AttendanceDrawer";
import FlipButton from "@/components/FlipButton";
import Header from "@/components/Header";

const placeholderImage = require("../assets/images/ServicesPlaceholder.png");

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function EventFocusScreen() {
  const { eventId } = useLocalSearchParams();
  const { i18n, t } = useTranslation();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("This is the event - ", event);

  const isRtl = i18n.dir() === "rtl";

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
    if (currentUserId) {
      fetchData();
    }
  }, [fetchData, currentUserId]);

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
              const response = await fetch(
                `${Globals.API_BASE_URL}/api/events/register`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
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

  const handleMarkAttendance = async (participantId, status) => {
    Alert.alert(
      "Attendance",
      `Marked user as ${status}. (Implementation pending)`
    );
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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!event) {
    return (
      <View style={styles.centered}>
        <Text>{t("Common_NotFound", "Event not found.")}</Text>
      </View>
    );
  }

  const isCreator = currentUserId === event.host?.hostId;
  const isRegistered = participants.some(
    (p) => p.participantId === currentUserId
  );
  const isFull = participants.length >= event.capacity;
  const canMarkAttendance = new Date(event.startDate) <= new Date();
  const hostName = isRtl ? event.host?.hebrewName : event.host?.englishName;
  const startTime = formatTime(event.startDate);
  const endTime = formatTime(event.endDate);
  const remainingSpots = event.capacity - participants.length;

  const DetailRow = ({ icon, label, value }) => (
    <View
      style={[
        styles.detailRow,
        { flexDirection: isRtl ? "row-reverse" : "row" },
      ]}
    >
      <Ionicons
        name={icon}
        size={24}
        color="#555"
        style={isRtl ? styles.iconRtl : styles.iconLtr}
      />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text
        style={[styles.detailValue, { textAlign: isRtl ? "left" : "right" }]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={placeholderImage} style={styles.image} />
        <Text style={[styles.title, { textAlign: isRtl ? "right" : "left" }]}>
          {event.eventName}
        </Text>
        <Text
          style={[styles.description, { textAlign: isRtl ? "right" : "left" }]}
        >
          {event.description}
        </Text>

        <View style={styles.detailsContainer}>
          <DetailRow
            icon="calendar-outline"
            label={t("EventFocus_Date", "Date")}
            value={new Date(event.startDate).toLocaleDateString()}
          />
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
            />
          )}
          <DetailRow
            icon="people-outline"
            label={t("EventFocus_Capacity", "Capacity")}
            value={`${participants.length} / ${event.capacity}`}
          />
        </View>

        {!isCreator && !isRegistered && remainingSpots > 0 && (
          <Text style={styles.spotsAvailableText}>
            {t("EventFocus_SpacesAvailable", { count: remainingSpots })}
          </Text>
        )}
        {!event.isRecurring && (
          <>
            {isCreator && (
              <AttendanceDrawer
                event={event}
                participants={participants}
                canMarkAttendance={canMarkAttendance}
                onMarkAttendance={handleMarkAttendance}
              />
            )}
            {!isCreator &&
              (isRegistered ? (
                <Text style={styles.statusText}>
                  {t("EventFocus_YouAreRegistered", "You are registered!")}
                </Text>
              ) : isFull ? (
                <Text style={styles.statusText}>
                  {t("EventFocus_ActivityFull", "This activity is full.")}
                </Text>
              ) : (
                <FlipButton
                  onPress={handleRegister}
                  style={styles.registerButton}
                  bgColor="#007bff"
                  textColor="#ffffff"
                >
                  <Text style={styles.buttonText}>
                    {t("Common_Register", "Register")}
                  </Text>
                </FlipButton>
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 50,
    backgroundColor: "#f8f9fa",
    marginTop: 60, // Margin for the absolute positioned Header
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#212529",
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    color: "#495057",
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    alignItems: "center",
    marginBottom: 18,
  },
  iconLtr: {
    marginRight: 15,
  },
  iconRtl: {
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343a40",
  },
  detailValue: {
    fontSize: 18,
    color: "#495057",
    flex: 1,
  },
  registerButton: {
    paddingVertical: 15, // FlipButton has its own padding, setting to 0 to avoid double padding
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statusText: {
    textAlign: "center",
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e9f5ec",
    borderRadius: 8,
  },
  spotsAvailableText: {
    fontSize: 16,
    color: "#28a745", // Green color to indicate availability
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20, // Add some space before the registration button
  },
});
