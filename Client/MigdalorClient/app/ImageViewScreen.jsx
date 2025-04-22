import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import FlipButton from "../components/FlipButton";
import { Ionicons } from "@expo/vector-icons";

export default function ImageViewScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const params = useLocalSearchParams();
  const { imageUri, altText = "" } = params;

  const insets = useSafeAreaInsets();

  const handleReturn = () => {
    router.back();
  };

  if (!imageUri || typeof imageUri !== "string") {
    console.error("ImageViewScreen: Invalid or missing imageUri", imageUri);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t("ImageViewScreen_ErrorNoImage")}
        </Text>
        <FlipButton onPress={handleReturn} style={styles.backButtonError}>
          <Text>{t("Common_backButton")}</Text>
        </FlipButton>
      </SafeAreaView>
    );
  }

  console.log(`ImageViewScreen displaying: URI=${imageUri}, Alt=${altText}`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.topButtonContainer, { top: insets.top }]}>
          <FlipButton
            onPress={handleReturn}
            style={styles.topButton}
            bgColor="white"
            textColor="black"
          >
            <Text style={styles.buttonText}>{t("Common_backButton")}</Text>
            <Ionicons name="arrow-back" size={28} color="black" />
          </FlipButton>
        </View>

        <ExpoImage
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
          alt={altText}
          placeholder={require("../assets/images/loading_placeholder.png")}
          transition={300}
          onError={(e) =>
            console.error(
              "[ExpoImage] Error loading image:",
              e?.error || "Unknown error",
              "URI:",
              imageUri
            )
          }
          onLoadStart={() => console.log("[ExpoImage] Load Start:", imageUri)}
          onLoad={(e) => console.log("[ExpoImage] Load Success:", e?.source)}
        />
      </View>

      <View style={styles.altTextContainer}>
        <Text style={styles.altTextStyle}>{altText}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10,
  },
  topButton: {
    padding: 8,
    borderRadius: 20,
  },
  imageInfoContainer: {
    alignItems: "flex-end",
  },
  imageInfoText: {
    color: "rgba(200, 200, 200, 0.8)",
    fontSize: 11,
    maxWidth: 150,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "black",
  },
  errorText: {
    fontSize: 18,
    color: "#ff8a8a",
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonError: {
    backgroundColor: "#555",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  altTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  altTextStyle: {
    fontSize: 26,
    color: "#e0e0e0",
    textAlign: "center",
    lineHeight: 26,
  },
});
