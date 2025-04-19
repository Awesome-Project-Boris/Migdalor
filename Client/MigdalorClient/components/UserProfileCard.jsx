// components/UserProfileCard.jsx
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import BouncyButton from "./BouncyButton";
import { useTranslation } from "react-i18next";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Assuming data structure: { userId: '...', name: '...', photoUrl: '...' }
function UserProfileCard({ data }) {
  const { t } = useTranslation();
  
  // Basic placeholder image if photoUrl is missing
  const placeholderImage = require("../assets/images/tempItem.jpg"); // CHANGE TO YOUR PLACEHOLDER IMAGE PATH
  const imageUrl = data?.photoUrl ? { uri: data.photoUrl } : placeholderImage;

  return (
    <BouncyButton
      style={styles.container}
      springConfig={{ bounciness: 10, speed: 50 }}
      shrinkScale={0.85}
      onPress={() =>
        console.log(
          "User profile card pressed" /*/ We will navigate to profile page here /*/
        )
      }
    >
      <Image source={imageUrl} style={styles.photo} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {data?.name || t("UserProfileCard_unnamedUser")}
        </Text>
      </View>
    </BouncyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default UserProfileCard;
