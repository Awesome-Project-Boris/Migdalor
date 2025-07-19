import React, { useMemo } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import BouncyButton from "./BouncyButton";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import StyledText from "@/components/StyledText";

const SCREEN_WIDTH = Dimensions.get("window").width;
const API_BASE_URL = Globals.API_BASE_URL;

// A default image to show if a user doesn't have a profile picture
const defaultUserImage = require("@/assets/images/defaultUser.png");

function UserProfileCard({ data, onPress }) {
  const { t } = useTranslation();

  // This is the key logic:
  // It now strictly checks the language setting and constructs the name.
  const displayName = useMemo(() => {
    if (Globals.userSelectedLanguage === 'he') {
      const hebFirstName = data?.hebFirstName?.trim() || "";
      const hebLastName = data?.hebLastName?.trim() || "";
      return `${hebFirstName} ${hebLastName}`.trim();
    } else {
      const engFirstName = data?.engFirstName?.trim() || "";
      const engLastName = data?.engLastName?.trim() || "";
      return `${engFirstName} ${engLastName}`.trim();
    }
  }, [data, Globals.userSelectedLanguage]);

  // This handles showing the user's photo or the default image
  const imageUrl = useMemo(() => {
    if (data?.photoUrl) {
      const relativePath = data.photoUrl.startsWith("/")
        ? data.photoUrl.substring(1)
        : data.photoUrl;
      return { uri: `${API_BASE_URL}/${relativePath}` };
    } else {
      return defaultUserImage;
    }
  }, [data?.photoUrl]);

  const isSingleWord = !displayName?.trim().includes(" ");

  return (
    <BouncyButton
      style={styles.container}
      springConfig={{ bounciness: 10, speed: 50 }}
      shrinkScale={0.85}
      onPress={onPress}
    >
      <Image
        source={imageUrl}
        style={styles.photo}
        onError={(e) =>
          console.log(`Failed to load image: ${imageUrl?.uri}`, e.nativeEvent.error)
        }
      />
      <View style={styles.infoContainer}>
        <StyledText
          style={styles.name}
          numberOfLines={isSingleWord ? 1 : 0}
          adjustsFontSizeToFit={isSingleWord}
          ellipsizeMode="tail"
        >
          {/* Use the displayName variable to show the correct name */}
          {displayName || t("UserProfileCard_unnamedUser")}
        </StyledText>
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