import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Pressable,
  Image,
  StyleSheet,
  I18nManager,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import { Spinner, YStack } from "tamagui";
// For checkbox, install @react-native-community/checkbox or use any other component library
import CheckboxWithLabel from "../../MigdalorClient/components/CheckBox";
import FlipButton from "../../MigdalorClient/components/FlipButton";
import OutlinedTextInput from "../../MigdalorClient/components/OutlinedTextInput";
import LabeledTextInput from "../../MigdalorClient/components/LabeledTextInput";

// Force RTL if your app is in Hebrew (optional)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Handle login logic here
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/TEMPLOGO.png")}
            // style={{ width: 200, height: 150 }} // Adjust dimensions as needed
            resizeMode="contain"
            alignSelf="center"
            // marginTop={50}
          />
        </View>

        {/* Login Form */}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // style={styles.container}
        >
          <View style={styles.formContainer}>
            <OutlinedTextInput
              onChangeText={setUsername}
              value={username}
              label="שם משתמש"
              autoCapitalize="none"
              mode="outlined"
            />
            <LabeledTextInput
              // style={styles.input}
              onChangeText={setPassword}
              value={password}
              label="סיסמה"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              placeholder="RTL Text"
              mode="outlined"
              style={{ textAlign: "right" }}
            />
            <OutlinedTextInput
              onChangeText={setPassword}
              value={password}
              label="סיסמה"
              secureTextEntry
            />

            <View style={styles.rememberMeContainer}>
              <CheckboxWithLabel
                checked={rememberMe}
                onCheckedChange={() => {
                  setRememberMe(!rememberMe);
                }}
                label="זכור אותי"
              />
            </View>
            <FlipButton
              text="כניסה"
              onPress={handleLogin}
              bgColor="#FF7F50"
              textColor="#013220"
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbe6d0", // Set background color to white
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "flex-start",
  },
  topBar: {
    flexDirection: "row-reverse", // For RTL: row-reverse places icons on the right
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
    // Add shadow if desired:
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 3,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: "right", // Align text to the right for Hebrew
    fontSize: 20,
    borderColor: "#bfbdbd",
    borderWidth: 1,
  },
  rememberMeContainer: {
    flexDirection: "row-reverse", // RTL
    alignItems: "center",
    marginBottom: 15,
    direction: "rtl",
  },
  rememberMeText: {
    marginRight: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#FF7F50",
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 26,
    color: "#013220",
    fontWeight: "bold",
  },
});
