import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView, // Import ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";
import { Globals } from "./constants/Globals";
import FlipButton from "../components/FlipButton";
import Header from "@/components/Header";
import StyledText from "@/components/StyledText";

const sunImage = require("../assets/images/sun.png");

export default function GoodMorningProcedure() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [isPrimarySignedIn, setIsPrimarySignedIn] = useState(false);
  const [isSpouseSignedIn, setIsSpouseSignedIn] = useState(false);
  const [userId, setUserId] = useState(null);

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
          router.replace("/LoginScreen");
          return;
        }

        setUserId(storedUserId);

        const response = await fetch(
          `${Globals.API_BASE_URL}/api/People/details/${storedUserId}`,
          { headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) throw new Error(await response.text());
        const userData = await response.json();
        if (userData && userData.spouseId) setHasSpouse(true);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: t("Common_Error"),
          text2: t("GoodMorning_IdError"),
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

      setIsPrimarySignedIn(true);
      if (includeSpouse) {
        setIsSpouseSignedIn(true);
      }

      Toast.show({
        type: "success",
        text1: t("GoodMorning_signInSuccessTitle"),
        text2: t("GoodMorning_signInSuccessMessage"),
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("Common_Error"),
        text2: t("GoodMorning_IdError"),
        position: "top",
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
    <View style={styles.rootContainer}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.sunContainer,
            { transform: [{ translateY: sunTranslateY }], opacity: sunOpacity },
          ]}
        >
          <Image source={sunImage} style={styles.sun} />
        </Animated.View>

        <View style={styles.titleContainer}>
          <StyledText style={styles.title}>{t("GoodMorning_title")}</StyledText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#fbbf24" />
        ) : (
          <View style={styles.buttonContainer}>
            <FlipButton
              onPress={() => handleSignIn(false)}
              disabled={isPrimarySignedIn || isLoading}
              style={styles.button}
              bgColor="#fbbf24"
              textColor="black"
            >
              <StyledText style={styles.buttonText}>
                {t("GoodMorning_signInMe")}
              </StyledText>
            </FlipButton>

            {hasSpouse && (
              <FlipButton
                onPress={() => handleSignIn(true)}
                disabled={isSpouseSignedIn || isLoading}
                style={styles.button}
                bgColor="#fca5a5"
                textColor="black"
              >
                <StyledText style={styles.buttonText}>
                  {t("GoodMorning_signInBoth")}
                </StyledText>
              </FlipButton>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scrollContainer: {
    flexGrow: 1, // Ensures the container can grow
    alignItems: "center",
    justifyContent: "space-around", // Distributes elements vertically
    paddingVertical: 40,
    paddingTop: 80, // Added padding to account for the header
  },
  sunContainer: {
    // Removed absolute positioning
    alignItems: "center",
  },
  sun: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  titleContainer: {
    // Removed absolute positioning
    alignItems: "center",
    marginVertical: 20, // Added space around the title
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center", // Ensures text is centered if it wraps
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    // Removed absolute positioning
    width: "100%",
    alignItems: "center",
    gap: 20,
    marginTop: 20, // Added space above buttons
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
