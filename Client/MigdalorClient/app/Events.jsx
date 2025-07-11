import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

export default function Events() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>{t("Events_Title")}</Text>
        <Text>{t("Events_Placeholder")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
