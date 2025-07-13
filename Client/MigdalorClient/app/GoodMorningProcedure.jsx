import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";
import { Globals } from "./constants/Globals";
import FlipButton from "../components/FlipButton";
import Header from "@/components/Header";

// Assuming sun.png is in assets/images
const sunImage = require("../assets/images/sun.png");

export default function GoodMorningProcedure() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [isPrimarySignedIn, setIsPrimarySignedIn] = useState(false);
  const [isSpouseSignedIn, setIsSpouseSignedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // Animation value
  const sunAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sunAnimation, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const fetchUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("jwt");
        const storedUserId = await AsyncStorage.getItem("userID");

        if (!storedToken || !storedUserId) {
          Toast.show({
            type: "error",
            text1: t("Common_Error"),
            text2: "Authentication session not found.",
          });
          router.replace("/LoginScreen");
          return;
        }

        setUserId(storedUserId);
        console.log("THIS IS USER ID: ", userId);

        const response = await fetch(
          `${Globals.API_BASE_URL}/api/People/details/${storedUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(await response.text());
        const userData = await response.json();
        if (userData && userData.spouseId) setHasSpouse(true);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: t("Common_Error"),
          text2: "Could not retrieve your profile details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [sunAnimation]);

  const handleSignIn = async (includeSpouse) => {
    setIsLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      if (!storedToken || !userId)
        throw new Error("User session information is missing.");

      const response = await fetch(
        `${Globals.API_BASE_URL}/api/BokerTov/SignIn`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            residentId: userId,
            includeSpouse: includeSpouse,
          }),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      // Update state to disable buttons based on the action
      setIsPrimarySignedIn(true);
      if (includeSpouse) {
        setIsSpouseSignedIn(true);
      }

      Toast.show({
        type: "success",
        text1: t("GoodMorning_signInSuccessTitle"),
        text2: t("GoodMorning_signInSuccessMessage"),
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Common_Error"),
        text2: error.message,
        position: "top",
        visibilityTime: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sunTranslateY = sunAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });
  const sunOpacity = sunAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.sunContainer,
            { transform: [{ translateY: sunTranslateY }], opacity: sunOpacity },
          ]}
        >
          <Image source={sunImage} style={styles.sun} />
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("GoodMorning_title")}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#fbbf24" />
        ) : (
          <View style={styles.buttonContainer}>
            <FlipButton
              onPress={() => handleSignIn(false)}
              disabled={isPrimarySignedIn || isLoading} // Only disabled if primary is signed in
              style={styles.button}
              bgColor="#fbbf24"
              textColor="black"
            >
              <Text style={styles.buttonText}>{t("GoodMorning_signInMe")}</Text>
            </FlipButton>

            {hasSpouse && (
              <FlipButton
                onPress={() => handleSignIn(true)}
                disabled={isSpouseSignedIn || isLoading} // CORRECTED: Only disabled if spouse is signed in
                style={styles.button}
                bgColor="#fca5a5"
                textColor="black"
              >
                <Text style={styles.buttonText}>
                  {t("GoodMorning_signInBoth")}
                </Text>
              </FlipButton>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  sunContainer: {
    position: "absolute",
    top: "20%",
  },
  sun: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  titleContainer: {
    position: "absolute",
    top: "50%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  button: {
    width: "80%",
    paddingVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
