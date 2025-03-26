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
} from "react-native";

import { XStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

import FlipButton from "../../MigdalorClient/components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../../MigdalorClient/components/CheckBox";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    console.log("Remember Me:", rememberMe);
  }, [rememberMe]);

  const handleLogin = () => {};

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
                  label="שם משתמש"
                  value={username}
                  onChangeText={setUsername}
                  textContentType="username"
                  keyboardType="default"
                  size={30}
                />
                <FloatingLabelInput
                  label="סיסמה"
                  value={password}
                  onChangeText={setPassword}
                  textContentType="password"
                  keyboardType="default"
                  secureTextEntry
                  size={30}
                />

                <TouchableWithoutFeedback
                  onPress={() => {
                    setRememberMe(!rememberMe);
                  }}
                >
                  <Checkbox
                    alignRight={true}
                    text="זכור אותי"
                    onPress={() => setRememberMe(!rememberMe)}
                  />
                </TouchableWithoutFeedback>
                <FlipButton
                  text="כניסה"
                  onPress={handleLogin}
                  bgColor="lightgrey"
                  textColor="black"
                  flipborderwidth={3}
                >
                  <XStack gap={5} style={{ paddingStart: 15 }}>
                    <Text style={styles.loginButtonText}>כניסה</Text>
                    <Ionicons name="log-in-outline" size={38} color="#013220" />
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
    direction: "rtl",
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
