import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useAuth } from "@/context/AuthProvider"; // Import useAuth
import { useTranslation } from "react-i18next"; // Import useTranslation
import i18n from "../app/utils/i18n"; // Assuming your i18n config is here

const SCREEN_WIDTH = Dimensions.get("window").width;

function Greeting() {
  const { user } = useAuth(); 
  const { t } = useTranslation(); 
  const [greetingKey, setGreetingKey] = useState("MainMenuNameplate_greetingGoodMorning"); // Default greeting key

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreetingKey("MainMenuNameplate_greetingGoodMorning");
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreetingKey("MainMenuNameplate_greetingGoodAfternoon");
      } else if (currentHour >= 18 && currentHour < 22) {
        setGreetingKey("MainMenuNameplate_greetingGoodEvening");
      } else {
        setGreetingKey("MainMenuNameplate_greetingGoodNight");
      }
    };
    updateGreeting();
  }, []);

 
  const currentLanguage = i18n.language; // Get current language
  const firstName =
    currentLanguage === "he" && user?.userHebFirstName
      ? user.userHebFirstName
      : user?.userEngFirstName || ""; // Fallback to English name or empty string

  const fullGreeting = `${t(greetingKey)}${
    firstName ? `, ${firstName}` : ""
  }${t("MainMenuNameplate_greetingPunctuation")}`; // Use translated punctuation like '!' or '!'

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{fullGreeting}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
    minHeight: 100, // Use minHeight to allow text wrapping
    backgroundColor: "#cdb876",
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 15, // Add padding for text
    paddingVertical: 10,
    //boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // boxShadow is not standard RN
    // Use elevation for Android shadow
    elevation: 5,
    // Use shadow props for iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center", // Center text if it wraps
  },
});

export default Greeting;