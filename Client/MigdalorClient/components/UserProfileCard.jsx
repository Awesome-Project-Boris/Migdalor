// components/UserProfileCard.jsx
import React, { useMemo} from "react";
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
import { Globals } from "@/app/constants/Globals";


const SCREEN_WIDTH = Dimensions.get("window").width;
const API_BASE_URL = Globals.API_BASE_URL;

// Assuming data structure: { userId: '...', name: '...', photoUrl: '...' }
function UserProfileCard({ data, onPress }) {
  const { t } = useTranslation();
  
  // Basic placeholder image if photoUrl is missing
  const placeholderImage = require("../assets/images/tempItem.jpg");

  // Construct the full image URL for the Image component
  const imageUrl = useMemo(() => {
    if (data?.photoUrl) {
      // data.photoUrl now contains the relative path like "path/to/image.jpg"
      // Prepend the base URL
      const relativePath = data.photoUrl.startsWith('/')
                           ? data.photoUrl.substring(1) // Avoid double slash if path starts with /
                           : data.photoUrl;
      return { uri: `${API_BASE_URL}/${relativePath}` }; // Combine base URL and relative path
    } else {
      return placeholderImage; // Use placeholder if no relative path provided
    }
  }, [data?.photoUrl]); 

  const displayName = useMemo(() => {
    const engFirst = data?.engFirstName?.trim();
    const engLast = data?.engLastName?.trim();
    const hebFirst = data?.hebFirstName?.trim();
    const hebLast = data?.hebLastName?.trim();

    if (engFirst || engLast) {
      return `${engFirst || ""} ${engLast || ""}`.trim();
    } else if (hebFirst || hebLast) {
      return `${hebFirst || ""} ${hebLast || ""}`.trim();
    } else {
      return t("UserProfileCard_unnamedUser");
    }
  }, [data, t]);

  return (
    <BouncyButton
      style={styles.container}
      springConfig={{ bounciness: 10, speed: 50 }}
      shrinkScale={0.85}
      onPress={onPress}
    >
      {/* Image source now uses the dynamically constructed full URL or placeholder */}
      <Image source={imageUrl} style={styles.photo} onError={(e) => console.log(`Failed to load image: ${imageUrl?.uri}`, e.nativeEvent.error)} />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
             {displayName}
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
