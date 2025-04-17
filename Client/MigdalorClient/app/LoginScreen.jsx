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
import { Toast } from "toastify-react-native";

import FlipButton from "@/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "@/components/CheckBox";

import { Globals } from "./constants/Globals";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { Stack } from "expo-router";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setloginLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setloginLoading(true);
      console.log("Login button pressed");

      // Call the provider's login function
      const data = await login(phoneNumber, password);

      Toast.show({
        type: "success",
        text1: "התחברת בהצלחה",
        duration: 3500,
        position: "top",
      });
      router.replace("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "שגיאה!",
        text2: "שם משתמש או סיסמה לא נכונים!",
        duration: 3500,
        position: "top",
      });
      console.error("Login failed:", error);
    } finally {
      setloginLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.container}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../assets/images/TEMPLOGO.png")}
                    resizeMode="contain"
                    style={styles.logo}
                  />
                </View>
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
                    secureTextEntry
                    size={35}
                  />
                  <FlipButton
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
                    text="Clear Storage"
                    onPress={() => {
                      AsyncStorage.clear();
                      Toast.show({
                        type: "info",
                        text1: "הסיסמה שלך הוסרה",
                        text2: "אנא התחבר מחדש",
                        duration: 1500,
                        position: "top",
                      });
                    }}
                    bgColor="#fbbf24"
                    textColor="black"
                    flipborderwidth={5}
                    disabled={loginLoading}
                  ></FlipButton>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </>
  );
};

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
    width: 250,
    height: 140,
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

export default LoginScreen;
