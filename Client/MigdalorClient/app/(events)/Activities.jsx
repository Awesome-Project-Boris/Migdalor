import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

import Header from "@/components/Header";

export default function ActivitiesScreen() {
  const sampleActivity = { eventId: 2, eventName: "Summer BBQ" };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Activities</Text>
        <Text style={styles.subtitle}>List of all one-time activities.</Text>

        {/* CORRECTED LINK: Points to the top-level screen with params */}
        <Link
          href={{
            pathname: "/EventFocus",
            params: { eventId: sampleActivity.eventId },
          }}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            {sampleActivity.eventName} (Tap to test)
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", marginTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 20 },
  link: { padding: 15, backgroundColor: "#f0f0f0", borderRadius: 8 },
  linkText: { fontSize: 16, color: "#00007a" },
});
