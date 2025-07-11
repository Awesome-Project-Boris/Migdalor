import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

import Header from "@/components/Header";

export default function EventFocusScreen() {
  const { eventId } = useLocalSearchParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching data for Event ID:", eventId);
    // Simulate API call
    setTimeout(() => {
      setEvent({
        eventName: `Details for Event ${eventId}`,
        description:
          "This is the placeholder description for the selected event. Details will be fetched and displayed here.",
      });
      setLoading(false);
    }, 500);
  }, [eventId]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (!event) {
    return <Text style={styles.title}>Event not found.</Text>;
  }

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>{event.eventName}</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", marginTop: 60 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  description: { fontSize: 16, lineHeight: 24 },
});
