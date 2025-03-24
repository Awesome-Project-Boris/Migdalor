import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

// To contain the user's name and time of day
// { Good Morning / Good Afternoon / Good Evening / Good Night }, { resident name }!

function Greeting() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Good Morning, {"resident name"}!</Text>
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
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
})

export default Greeting;

