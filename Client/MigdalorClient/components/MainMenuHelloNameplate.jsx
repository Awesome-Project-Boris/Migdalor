import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useAuth } from "@/context/AuthProvider"; // Import useAuth
import { useTranslation } from "react-i18next"; // Import useTranslation
import i18n from "../app/utils/i18n"; // Assuming your i18n config is here
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const SCREEN_WIDTH = Dimensions.get("window").width;

function Greeting() {
  
  const [userHebFirstName, setUserHebFirstName] = useState("");
  const [userEngFirstName, setUserEngFirstName] = useState("");

  const { t } = useTranslation(); 
  const [greetingKey, setGreetingKey] = useState("greeting_goodMorning"); // Default greeting key

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const storedHebName = await AsyncStorage.getItem("userHebFirstName");
        const storedEngName = await AsyncStorage.getItem("userEngFirstName");

        setUserHebFirstName(storedHebName || ""); 
        setUserEngFirstName(storedEngName || ""); 

        console.log("Fetched Heb Name:", storedHebName);
        console.log("Fetched Eng Name:", storedEngName);
      } catch (e) {
        console.error("Failed to fetch names from storage for Greeting", e);
        // Optionally set names to empty strings or handle error state
        setUserHebFirstName("");
        setUserEngFirstName("");
      }
    };

    fetchUserNames(); // Call the async function
  }, []);


  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreetingKey("greeting_goodMorning");
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreetingKey("greeting_goodAfternoon");
      } else if (currentHour >= 18 && currentHour < 22) {
        setGreetingKey("greeting_goodEvening");
      } else {
        setGreetingKey("greeting_goodNight");
      }
    };
    updateGreeting();
  }, []);

 
  const currentLanguage = i18n.language; // Get current language
  const firstName =
    currentLanguage === "he" && userHebFirstName
      ? userHebFirstName
      : userEngFirstName || ""; // Fallback to English name or empty string

console.log("Name from greet plate:", firstName)

  const fullGreeting = `${t(greetingKey)}${
    firstName ? `, ${firstName}` : ""
  }${t("greeting_punctuation")}`; // Use translated punctuation like '!' or '!'

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