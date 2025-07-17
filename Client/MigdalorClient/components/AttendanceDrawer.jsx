import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StyledText from "@/components/StyledText.jsx";
import { useSettings } from "@/context/SettingsContext.jsx";
import { Globals } from "@/app/constants/Globals";

const API = Globals.API_BASE_URL;

const AttendanceDrawer = ({ participants, canMarkAttendance, eventId }) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const isRtl = i18n.dir() === "rtl";

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participationStatus, setParticipationStatus] = useState({});
  const [editingParticipantId, setEditingParticipantId] = useState(null);

  const useColumnLayout = settings.fontSizeMultiplier > 1.5;

  useEffect(() => {
    const fetchParticipation = async () => {
      if (!isOpen || !eventId) return;

      setIsLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("jwt");
        const response = await fetch(`${API}/api/Participation/${eventId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch participation status.");
        }

        const data = await response.json();
        const statusMap = data.reduce((acc, p) => {
          acc[p.participantId] = p.status;
          return acc;
        }, {});

        setParticipationStatus(statusMap);
      } catch (error) {
        console.error("Error fetching participation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipation();
  }, [isOpen, eventId]);

  const handleMarkAttendance = async (participantId, status) => {
    try {
      const authToken = await AsyncStorage.getItem("jwt");
      const requestBody = {
        eventId: eventId,
        participantId: participantId,
        status: status,
      };

      const response = await fetch(`${API}/api/Participation/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const detailedError = `HTTP Status: ${
          response.status
        }\n\nServer Response: ${errorBody || "No message from server."}`;
        throw new Error(detailedError);
      }

      setParticipationStatus((prevStatus) => ({
        ...prevStatus,
        [participantId]: status,
      }));
    } catch (error) {
      console.error("Error marking attendance:", error.message);
      Alert.alert("Attendance Update Failed", error.message);
    } finally {
      setEditingParticipantId(null);
    }
  };

  const headerStyle = [
    styles.header,
    { flexDirection: isRtl ? "row-reverse" : "row" },
  ];
  const textStyle = { textAlign: isRtl ? "right" : "left" };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={headerStyle} onPress={() => setIsOpen(!isOpen)}>
        <StyledText style={styles.headerText}>
          {t("EventFocus_MarkAttendance", "Click to Mark Attendance")}
        </StyledText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#007bff"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : !canMarkAttendance ? (
            <StyledText style={[styles.warningText, textStyle]}>
              {t(
                "EventFocus_MarkingNotAvailable",
                "Attendance marking can only occur on the day of the event or later."
              )}
            </StyledText>
          ) : (
            <View>
              {participants.length > 0 ? (
                participants.map((item) => {
                  const participantId = item.participantId.toString();
                  const currentStatus = participationStatus[participantId];
                  const isEditing = editingParticipantId === participantId;

                  return (
                    <View
                      key={participantId}
                      style={[
                        styles.participantRowBase,
                        useColumnLayout
                          ? styles.participantRowColumn
                          : styles.participantRow,
                      ]}
                    >
                      <StyledText
                        style={[
                          styles.participantName,
                          textStyle,
                          useColumnLayout && { marginBottom: 10 },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {isRtl ? item.hebrewFullName : item.englishFullName}
                      </StyledText>
                      <View style={styles.buttonGroup}>
                        {currentStatus && !isEditing ? (
                          <>
                            <StyledText style={styles.statusText}>
                              {t(`Common_${currentStatus}`, currentStatus)}
                            </StyledText>
                            <TouchableOpacity
                              style={[styles.statusButton, styles.editButton]}
                              onPress={() =>
                                setEditingParticipantId(participantId)
                              }
                            >
                              <StyledText style={styles.buttonText}>
                                {t("Common_Edit", "Edit")}
                              </StyledText>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.statusButton,
                                styles.attendedButton,
                              ]}
                              onPress={() =>
                                handleMarkAttendance(participantId, "Attended")
                              }
                            >
                              <StyledText style={styles.buttonText}>
                                {t("Common_Attended", "Attended")}
                              </StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.statusButton, styles.absentButton]}
                              onPress={() =>
                                handleMarkAttendance(participantId, "Absent")
                              }
                            >
                              <StyledText style={styles.buttonText}>
                                {t("Common_Absent", "Absent")}
                              </StyledText>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <StyledText style={styles.infoText}>
                  {t("EventFocus_NoParticipants", "No one has registered yet.")}
                </StyledText>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 20,
    overflow: "hidden",
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    lineHeight: 24,
  },
  content: { padding: 16, minHeight: 50 },
  warningText: {
    color: "#fd7e14",
    fontSize: 16,
    lineHeight: 22,
    fontStyle: "italic",
  },
  infoText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
    fontSize: 16,
    lineHeight: 22,
  },
  participantRowBase: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantRowColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  participantName: {
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
    marginRight: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  attendedButton: { backgroundColor: "#28a745" },
  absentButton: { backgroundColor: "#dc3545" },
  editButton: { backgroundColor: "#6c757d" },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 18,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default AttendanceDrawer;
