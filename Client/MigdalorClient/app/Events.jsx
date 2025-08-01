import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";
import { Toast } from "toastify-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

import Header from "@/components/Header";
import { useAuth } from "@/context/AuthProvider";
import { Globals } from "@/app/constants/Globals";
import FlipButton from "@/components/FlipButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StyledText from "@/components/StyledText"; // Import StyledText
import { useSettings } from "@/context/SettingsContext.jsx";

export default function Events() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [instances, setInstances] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  const checkboxBaseSize = 24;
  const dynamicCheckboxStyle = {
    height: checkboxBaseSize * settings.fontSizeMultiplier,
    width: checkboxBaseSize * settings.fontSizeMultiplier,
  };
  const dynamicCheckboxInnerStyle = {
    height: (checkboxBaseSize / 2) * settings.fontSizeMultiplier,
    width: (checkboxBaseSize / 2) * settings.fontSizeMultiplier,
  };

  const fetchInstructorEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await fetch(`${Globals.API_BASE_URL}/api/InstructorEvents/MyEvents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch events.");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInstructorEvents();
  }, [fetchInstructorEvents]);

  useEffect(() => {
    const fetchInstances = async () => {
      if (!selectedEvent) {
        setInstances([]);
        setSelectedInstance(null);
        return;
      }
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("jwt");
        const response = await fetch(
          `${Globals.API_BASE_URL}/api/InstructorEvents/${selectedEvent}/Instances`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch event instances.");
        const data = await response.json();
        setInstances(data);
        setSelectedInstance(null);
      } catch (error) {
        Toast.show({ type: "error", text1: "Error", text2: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchInstances();
  }, [selectedEvent]);

  const resetForm = () => {
      setSelectedEvent(null);
      setInstances([]);
      setSelectedInstance(null);
      setNotes("");
      setIsRescheduling(false);
      setNewDate(new Date());
      fetchInstructorEvents();
  }

  const handleSubmit = async () => {
    if (!selectedInstance || !notes.trim()) {
      Alert.alert(t("Events_MissingInformation"), t("Events_MissingInformationMessage"));
      return;
    }
    
    const endpoint = isRescheduling ? 'RescheduleInstance' : 'CancelInstance';
    const method = isRescheduling ? 'POST' : 'PUT';
    
    let body = {
        instanceId: selectedInstance,
        notes: notes,
    };

    if (isRescheduling) {
        if (newDate < new Date()) {
            Alert.alert(t("Events_InvalidDate"), t("Events_InvalidDateMessage"));
            return;
        }

        const originalInstance = instances.find(i => i.instanceId === selectedInstance);
        const duration = new Date(originalInstance.endTime) - new Date(originalInstance.startTime);
        const newEndTime = new Date(newDate.getTime() + duration);

        body = { ...body, newStartTime: newDate.toISOString(), newEndTime: newEndTime.toISOString() };
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await fetch(`${Globals.API_BASE_URL}/api/InstructorEvents/${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update meeting.");
      }

      const successMessage = isRescheduling ? t("Events_MeetingRescheduled") : t("Events_MeetingCancelled");
      Toast.show({ type: "success", text1: successMessage, text2: t("Events_ParticipantsHaveBeenNotified") });
      resetForm();

    } catch (error) {
      Toast.show({ type: "error", text1: t("Update_Failed"), text2: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newDate;
    setShowPicker(Platform.OS === 'ios');
    setNewDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setPickerMode(currentMode);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <StyledText>{t("Events_Loading")}</StyledText>
      </View>
    );
  }

  if (!loading && events.length === 0) {
      return (
          <View style={styles.container}>
              <Header />
              <View style={styles.centered}>
                  <StyledText style={styles.title}>{t("Events_Title", "Manage My Events")}</StyledText>
                  <StyledText style={styles.noEventsText}>{t("Events_NoEvents", "You have no events to manage at this time.")}</StyledText>
              </View>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StyledText style={styles.title}>{t("Events_Title", "Manage My Events")}</StyledText>

        <StyledText style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? 'right' : 'left' }]}>
          {t("Events_Selct")}
        </StyledText>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedEvent} onValueChange={(itemValue) => setSelectedEvent(itemValue)}>
            <Picker.Item label={t("Events_Choose")} value={null} />
            {events.map((event) => (
              <Picker.Item key={event.eventId} label={event.eventName} value={event.eventId} />
            ))}
          </Picker>
        </View>

        {selectedEvent && (
          <>
            <StyledText style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? 'right' : 'left' }]}>
              {t("Events_SelectMeeting")}
            </StyledText>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedInstance} onValueChange={(itemValue) => setSelectedInstance(itemValue)} enabled={instances.length > 0}>
                <Picker.Item label={instances.length > 0 ? t("Events_ChooseDate") : t("Events_NoMeetings")} value={null} />
                {instances.map((instance) => {
                  const date = new Date(instance.startTime);
                  const formattedDate = date.toLocaleDateString('en-GB');
                  const formattedTime = date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  const formattedLabel = `${formattedDate}, ${formattedTime}`;
                  return (
                    <Picker.Item key={instance.instanceId} label={formattedLabel} value={instance.instanceId} />
                  );
                })}
              </Picker>
            </View>
          </>
        )}

        {selectedInstance && (
            <View style={styles.formContainer}>
                <View style={{ flexDirection: Globals.userSelectedDirection === 'rtl' ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.checkbox, dynamicCheckboxStyle]} 
                    onPress={() => setIsRescheduling(!isRescheduling)}
                  >
                    {isRescheduling && <View style={[styles.checkboxInner, dynamicCheckboxInnerStyle]} />} 
                  </TouchableOpacity>
                  <StyledText style={styles.checkboxLabel}>
                    {t("Events_MoveMeeting")}
                  </StyledText>
                </View>

                {isRescheduling && (
                    <View>
                        <StyledText style={[styles.label, { textAlign: Globals.userSelectedDirection === 'rtl' ? 'right' : 'left' }]}>
                          {t("Events_NewMeeting")}
                        </StyledText>
                        <View style={styles.datePickerRow}>
                            <TouchableOpacity onPress={() => showMode('date')} style={styles.dateButton}>
                                <StyledText style={styles.dateButtonText}>{newDate.toLocaleDateString('en-GB')}</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => showMode('time')} style={styles.dateButton}>
                                <StyledText style={styles.dateButtonText}>{newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</StyledText>
                            </TouchableOpacity>
                        </View>
                        {showPicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={newDate}
                                mode={pickerMode}
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>
                )}

                <StyledText style={[styles.label, { textAlign: Globals.userSelectedDirection === 'rtl' ? 'right' : 'left' }]}>
                  {isRescheduling ? t("Events_Reason_for_Move") : t("Events_Reason_for_Cancellation")}
                </StyledText>
                <TextInput
                    style={[styles.input, { fontSize: 16 * settings.fontSizeMultiplier }]}
                    placeholder={t("Events_DescriptionPlaceholder")}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
                <FlipButton
                    onPress={handleSubmit}
                    bgColor={isRescheduling ? "#2196F3" : "#f44336"}
                    textColor="white"
                    style={styles.actionButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator color="white" /> : <StyledText style={styles.buttonText}>{isRescheduling ? t("Events_Confirm_Move") : t("Events_Confirm_Cancellation")}</StyledText>}
                </FlipButton>
            </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fef1e6" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContent: { padding: 20, paddingBottom: 60, paddingTop: 80, },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "white" },
  formContainer: { marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 100, backgroundColor: '#f9f9f9', fontSize: 16, textAlignVertical: 'top' },
  actionButton: { marginTop: 20, paddingVertical: 15 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  checkbox: { 
    borderRadius: 4, 
    borderWidth: 2, 
    borderColor: '#007aff', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkboxInner: { 
    borderRadius: 2, 
    backgroundColor: '#007aff' 
  },
  checkboxLabel: {
    fontSize: 18, 
    fontWeight: '600',
    flexShrink: 1, 
  },
  datePickerRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  dateButton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, alignItems: 'center', flex: 1, marginHorizontal: 5 },
  dateButtonText: { fontSize: 16 },
  noEventsText: {
      fontSize: 18,
      textAlign: 'center',
      color: '#666',
      marginTop: 10,
  }
});