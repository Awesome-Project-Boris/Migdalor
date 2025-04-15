import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  I18nManager,
  Alert,
} from "react-native";
import { XStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import auth from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

import FlipButton from "@/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "@/components/CheckBox";

import { Globals } from "./constants/Globals";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setloginLoading] = useState(false);
  const [loginGoogleLoading, setloginGoogleLoading] = useState(false);

  console.log("url is " + Globals.API_BASE_URL);
  

  ///////////////////////////////// Google SignIn /////////////////////////////////

  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId:
  //       "190847974757-0tma92g00au1nv1m1jp4elefpg6ut0d9.apps.googleusercontent.com",
  //   });
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = auth().onAuthStateChanged((user) => {
  //     if (user) setUserInfo(user);
  //   });
  //   return unsubscribe;
  // }, []);

  ///////////////////////////////// Google SignIn /////////////////////////////////

  const handleLogin = async () => {
    try {
      setloginLoading(true);
      console.log("Login button pressed");

      const phone = phoneNumber;
      const pass = password;
      const apiurl = `${Globals.API_BASE_URL}/api/People/login`;
      console.log("API URL:", apiurl);

      const response = await fetch(`${Globals.API_BASE_URL}/api/People/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phone,
          password: pass,
        }),
      });
      if (!response.ok) {
        Alert.alert(
          "שגיאה",
          "המשתמש לא קיים במערכת או שהסיסמה שגויה",
          [{ text: "אוקי", style: "cancel" }],
          { cancelable: false }
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Login successful:", data);

      // AsyncStorage.setItem("userToken", data.token); // Store the token in AsyncStorage
      if (rememberMe) AsyncStorage.setItem("userID", data.personId); // Store the user ID in AsyncStorage
      Alert.alert(
        "התחברות",
        "התחברת בהצלחה",
        [{ text: "אוקי", style: "cancel" }],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setloginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setloginGoogleLoading(true);
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error("Google Sign-In error", error);
    } finally {
      setloginGoogleLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.container}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/TEMPLOGO.png")}
                  resizeMode="contain"
                  alignSelf="center"
                />
              </View>

              {/* Login Form */}

              <View style={styles.formContainer}>
                <FloatingLabelInput
                  label="מספר טלפון"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  textContentType="telephoneNumber"
                  keyboardType="numeric"
                  maxLength={10}
                  size={35}
                />
                <FloatingLabelInput
                  label="סיסמה"
                  value={password}
                  onChangeText={setPassword}
                  textContentType="password"
                  keyboardType="default"
                  secureTextEntry
                  size={35}
                />

                <TouchableWithoutFeedback
                  onPress={() => {
                    setRememberMe(!rememberMe);
                  }}
                >
                  <Checkbox
                    alignRight={true}
                    text="זכור אותי"
                    fillColor="black"
                    onPress={() => setRememberMe(!rememberMe)}
                  />
                </TouchableWithoutFeedback>

                <FlipButton
                  text="כניסה"
                  onPress={handleLogin}
                  bgColor="#60a5fa"
                  textColor="black"
                  flipborderwidth={5}
                  disabled={loginLoading}
                >
                  <XStack gap={5} style={{ paddingStart: 15 }}>
                    <Text style={styles.loginButtonText}>כניסה</Text>
                    {loginLoading ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <Ionicons name="log-in-outline" size={38} />
                    )}
                  </XStack>
                </FlipButton>
                <FlipButton
                  text="כניסה עם גוגל"
                  onPress={handleGoogleSignIn}
                  bgColor="#dc2626"
                  textColor="white"
                  flipborderwidth={5}
                >
                  <XStack gap={8} style={{ paddingStart: 15 }}>
                    <Text style={styles.loginButtonText}>כניסה עם גוגל</Text>
                    {loginGoogleLoading ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <Ionicons name="logo-google" size={34} />
                    )}
                  </XStack>
                </FlipButton>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#c5d8d1",
  },
  container: {
    flex: 1,

    ...(Platform.OS === "web" && {
      alignItems: "center",
    }),
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "flex-start",
  },
  topBar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginHorizontal: 20,
  },
  icon: {
    width: 30,
    height: 30,
    marginLeft: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 60,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    gap: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: "right",
    fontSize: 20,
    borderColor: "#bfbdbd",
    borderWidth: 1,
  },
  rememberMeContainer: {
    writingDirection: "rtl",
  },
  rememberMeText: {
    marginRight: 8,
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 26,

    fontWeight: "bold",
    pointerEvents: "none",
  },
});
