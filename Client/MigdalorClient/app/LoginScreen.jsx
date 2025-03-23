import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  I18nManager,
} from "react-native";
// For checkbox, install @react-native-community/checkbox or use any other component library
import CheckboxWithLabel from "../components/CheckBox"

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
    <View style={styles.container}>
      {/* Background Image */}
      {/* <ImageBackground
        source={require("./assets/background.png")} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover"
      > */}
      {/* Top Bar Icons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            /* Info icon action */
          }}
        >
          {/* <Image
            source={require("./assets/info_icon.png")} // Replace with your image path
            style={styles.icon}
          /> */}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            /* Accessibility icon action */
          }}
        >
          {/* <Image
            source={require("./assets/wheelchair_icon.png")} // Replace with your image path
            style={styles.icon}
          /> */}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            /* Language switch action */
          }}
        >
          {/* <Image
            source={require("./assets/english_flag.png")} // Replace with your image path
            style={styles.icon}
          /> */}
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        {/* <Image
          source={require("./assets/logo.png")} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        /> */}
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder="שם משתמש"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="סיסמה"
          placeholderTextColor="#888"
          secureTextEntry
        />

        <View style={styles.rememberMeContainer}>
          <CheckboxWithLabel/>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>כניסה</Text>
        </TouchableOpacity>
      </View>
      {/* </ImageBackground> */}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: 15
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
    direction: "rtl"
  },
  rememberMeText: {
    marginRight: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#f2ca2f",
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 26,
    color: "#000",
    fontWeight: "bold",
  },
});
