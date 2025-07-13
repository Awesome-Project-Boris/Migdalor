import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // FlatList has been removed to fix the nesting error
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const AttendanceDrawer = ({
  participants,
  canMarkAttendance,
  onMarkAttendance,
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = i18n.dir() === "rtl";

  const headerStyle = [
    styles.header,
    { flexDirection: isRtl ? "row-reverse" : "row" },
  ];
  const textStyle = { textAlign: isRtl ? "right" : "left" };

  const handleMarkAttendance = (participantId, status) => {
    // This calls the function passed down from EventFocus
    onMarkAttendance(participantId, status);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={headerStyle} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.headerText}>
          {t("EventFocus_MarkAttendance", "Click to Mark Attendance")}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#007bff"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.content}>
          {!canMarkAttendance ? (
            <Text style={[styles.warningText, textStyle]}>
              {t(
                "EventFocus_MarkingNotAvailable",
                "Attendance marking can only occur on the day of the event or later."
              )}
            </Text>
          ) : (
            // The FlatList has been replaced with a View and a .map() function
            <View>
              {participants.length > 0 ? (
                participants.map((item) => (
                  <View
                    key={item.participantId.toString()}
                    style={styles.participantRow}
                  >
                    <Text style={[styles.participantName, textStyle]}>
                      {isRtl ? item.hebrewFullName : item.englishFullName}
                    </Text>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={[styles.statusButton, styles.attendedButton]}
                        onPress={() =>
                          handleMarkAttendance(item.participantId, "Attended")
                        }
                      >
                        <Text style={styles.buttonText}>
                          {t("Common_Attended", "Attended")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusButton, styles.absentButton]}
                        onPress={() =>
                          handleMarkAttendance(item.participantId, "Absent")
                        }
                      >
                        <Text style={styles.buttonText}>
                          {t("Common_Absent", "Absent")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                // This replaces the ListEmptyComponent from the FlatList
                <Text style={styles.infoText}>
                  {t("EventFocus_NoParticipants", "No one has registered yet.")}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Styles for the drawer (unchanged)
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 20,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  content: { padding: 16 },
  warningText: { color: "orange", fontSize: 16, fontStyle: "italic" },
  infoText: { textAlign: "center", fontStyle: "italic", color: "#666" },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  participantName: { fontSize: 16, flex: 1 },
  buttonGroup: { flexDirection: "row" },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  attendedButton: { backgroundColor: "#28a745" },
  absentButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default AttendanceDrawer;
