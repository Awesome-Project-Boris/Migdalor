import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import MainMenuButtons from "@/components/MainMenuButtons";
import { useMainMenuEdit } from "../context/MainMenuEditProvider";
import FlipButton from "../components/FlipButton";
import Greeting from "../components/MainMenuHelloNameplate";
import Header from "../components/Header";
import { EditToggleButton } from "../components/MainMenuFinishEditButton";
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";

const showDevButton = true;

const viewAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    if (result.length === 0) {
      console.log("No data found in AsyncStorage.");
      return;
    }
    result.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    return result;
  } catch (error) {
    console.error("Error viewing AsyncStorage data:", error);
  }
};

export default function Index() {
  const { setEditing } = useMainMenuEdit();

  useEffect(() => {
    return () => {
      setEditing(false);
    };
  }, [setEditing]);

  return (
    <View style={styles.container}>
      <Header />
      <Greeting />(
      {showDevButton && (
        <FlipButton
          text="View All Data"
          bgColor="#fbbf24"
          textColor="black"
          style={styles.toggleButton}
          flipborderwidth={5}
          onPress={viewAllData}
        ></FlipButton>
      )}
      )
      <EditToggleButton />
      <MainMenuButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#fbe6d0",
  },
  toggleButton: {
    width: 300,
    height: 70,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#000000",
    fontSize: 24,
  },
  openButton: {
    width: 150,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  openButtonText: {
    fontSize: 18,
    color: "#000",
  },
});
