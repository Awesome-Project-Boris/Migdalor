import { View } from "tamagui";
//import CheckboxDemo from "../../components/CheckBox";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Globals } from "@/app/constants/Globals";
import FlipButton from "../../components/FlipButton";
import { useState, useEffect } from "react";
import { Slider, XStack, YStack, ZStack, Text, Image, styled } from "tamagui";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";




const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function NotificationSettingsPage() {
  const {t} = useTranslation();
  const [notificationsSetting, setNotificationsSetting] = useState(Globals.userNotificationsSetting);

  useEffect(() => {
    Globals.userNotificationsSetting = notificationsSetting;
    //console.log("Notifications setting: " + notificationsSetting);

  }, [notificationsSetting]);

  return (
    <View style={{ flex: 1 }} >
      <Header />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60, paddingTop: 60 }}> 
        <YStack style={{ flex: 1 }} height={110} alignItems="baseline" gap="$5" alignSelf="center">
          <Text
            fontSize={40}
            fontWeight={800}
            alignSelf="center"
            // direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}

          >
            {t("NotificationSettingsPage_header")}
          </Text>

          <FlipButton 
            style={styles.button}
            bgColor={notificationsSetting == "both" ? "#0b0908" : "#ffffff"}
            textColor={notificationsSetting == "both" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setNotificationsSetting("both");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("NotificationSettingsPage_both")}</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            bgColor={notificationsSetting == "sound" ? "#0b0908" : "#ffffff"}
            textColor={notificationsSetting == "sound" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setNotificationsSetting("sound");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("NotificationSettingsPage_sound")}</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            bgColor={notificationsSetting == "vibration" ? "#0b0908" : "#ffffff"}
            textColor={notificationsSetting == "vibration" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setNotificationsSetting("vibration");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("NotificationSettingsPage_vibrate")}</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            bgColor={notificationsSetting == "none" ? "#0b0908" : "#ffffff"}
            textColor={notificationsSetting == "none" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setNotificationsSetting("none");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("NotificationSettingsPage_silent")}</Text>
          </FlipButton>
        </YStack>
      
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  button: {
    width: SCREEN_WIDTH * 0.7,
    height: 100,
    backgroundColor: "#4CAF50",
    // color: "#050404",
    borderRadius: 8,
    justifyContent: "center",
    // alignItems: "center",
    alignSelf: "center",
  },
  selectedButton: {
    width: SCREEN_WIDTH * 0.7,
    height: 100,
    backgroundColor: "#ef3d11",
    color: "#050404",
    borderRadius: 8,
    justifyContent: "center",
    // alignItems: "center",
    alignSelf: "center",
  },
  icon: {
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});