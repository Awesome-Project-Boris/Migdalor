import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import MainMenuButtons from "@/components/MainMenuButtons";
import Greeting from "../components/MainMenuHelloNameplate";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

export default function InstructorMainMenu() {
  const { t } = useTranslation();
  const router = useRouter();

  const buttonData = [
    {
      key: "menu1",
      name: t("MainMenuScreen_ProfileButton"),
      destination: "InstructorProfile",
    },
    {
      key: "menu2",
      name: t("InstructorMainMenu_EventsButton"),
      destination: "Events",
    },
  ];

  const handleDragEnd = ({ data }) => {
    // The order is fixed for instructors, so we don't need to do anything here.
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Header />
        <Greeting />
        <MainMenuButtons data={buttonData} onDragEnd={handleDragEnd} draggable={false} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fbe6d0",
  },
});
