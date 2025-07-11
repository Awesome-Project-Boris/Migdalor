import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

import Header from "@/components/Header";

export default function ClassesScreen() {
  const sampleClass = { eventId: 1, eventName: "Weekly Yoga" };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Classes</Text>
        <Text style={styles.subtitle}>List of all recurring classes.</Text>

        {/* CORRECTED LINK: Points to the top-level screen with params */}
        <Link
          href={{
            pathname: "/EventFocus",
            params: { eventId: sampleClass.eventId },
          }}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            {sampleClass.eventName} (Tap to test)
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
