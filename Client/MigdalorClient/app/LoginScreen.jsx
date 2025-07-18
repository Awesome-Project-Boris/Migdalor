import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  I18nManager,
} from "react-native";
import { XStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import FlipButton from "@/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import { Globals } from "./constants/Globals";
import { router, Stack } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation } from "react-i18next";
import StyledText from "@/components/StyledText"; // Import StyledText

const LoginScreen = () => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      const data = await login(phoneNumber, password);
      Toast.show({
        type: "success",
        text1: t("LoginScreen_loginSuccess"),
        duration: 3500,
        position: "top",
      });
      router.replace("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("LoginScreen_loginErrorTitle"),
        text2: t("LoginScreen_loginErrorMessage"),
        duration: 3500,
        position: "top",
      });
      console.error("Login failed:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.flex}
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
                    label={t("LoginScreen_phoneNumberLabel")}
                    alignRight={Globals.userSelectedDirection === "rtl"}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    textContentType="telephoneNumber"
                    keyboardType="numeric"
                    maxLength={10}
                    size={35}
                  />

                  <FloatingLabelInput
                    label={t("LoginScreen_passwordLabel")}
                    alignRight={Globals.userSelectedDirection === "rtl"}
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
                    <XStack gap={5} alignItems="center" style={{ paddingStart: 15 }}>
                      <StyledText style={styles.loginButtonText}>
                        {t("LoginScreen_loginButton")}
                      </StyledText>
                      {loginLoading ? (
                        <ActivityIndicator size="large" />
                      ) : (
                        <Ionicons name="log-in-outline" size={38} />
                      )}
                    </XStack>
                  </FlipButton>
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
  flex: { flex: 1 },
  page: {
    flex: 1,
    backgroundColor: "#c5d8d1",
  },
  container: {
    flex: 1,
    ...(Platform.OS === "web" && { alignItems: "center" }),
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
  loginButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    pointerEvents: "none",
  },
});

export default LoginScreen;