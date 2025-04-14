import React, { useState, useEffect } from "react"; 
import { View, Text, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const getGreeting = (hour) => {
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 18) { 
    return "Good Afternoon";
  } else if (hour >= 18 && hour < 21) {  
    return "Good Evening";
  } else { 
    return "Good Night";
  }
};

function Greeting() {
  const [greetingText, setGreetingText] = useState("");

  useEffect(() => {
    const currentHour = new Date().getHours(); 
    const calculatedGreeting = getGreeting(currentHour);
    setGreetingText(calculatedGreeting);

  }, []); 

  const residentName = "resident name"; // placeholder

  return (
    <View style={styles.container}>
       <Text style={styles.text}>{greetingText}, {residentName}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
    height: 100,
    backgroundColor: "#cdb876",
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#333', 
  },
});

export default Greeting;