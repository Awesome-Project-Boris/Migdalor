import { View } from "tamagui";
//import CheckboxDemo from "../../components/CheckBox";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Globals } from "@/app/constants/Globals";
import { useState, useEffect } from "react";
import { Slider, XStack, YStack, ZStack, Text, Image, styled } from "tamagui";
import FlipButton from "../../components/FlipButton";
import { useTranslation } from "react-i18next";


const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function LanguageSettingsPage() {
  const {t, i18n} = useTranslation();

  const [languageSetting, setLanguageSetting] = useState(Globals.userSelectedLanguage);

  useEffect(() => {
    Globals.userSelectedLanguage = languageSetting;
    //console.log("Language setting: " + languageSetting);
    i18n.changeLanguage(languageSetting);
  }, [languageSetting]);


  return (
    <View style={{ flex: 1 }} >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}> 
        <YStack height={70} alignItems="baseline" gap="$5" alignSelf="center">

        <Text
            fontSize={40}
            fontWeight={800}
            alignSelf="center"
            // direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
          >
            {t("LanguageSettingsPage_header")}
          </Text>


          <FlipButton 
            style={styles.button}
            bgColor={languageSetting == "he" ? "#0b0908" : "#ffffff"}
            textColor={languageSetting == "he" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setLanguageSetting("he");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("LanguageSettingsPage_he")}</Text>
          </FlipButton>

          <FlipButton
            style={styles.button}
            bgColor={languageSetting == "en" ? "#0b0908" : "#ffffff"}
            textColor={languageSetting == "en" ? "#ffffff" : "#0b0908"}
            onPress={() => 
            {
              setLanguageSetting("en");
              // router.navigate("./GeneralSettings");
              // bottomSheetRef.current?.close();
            }}
          >
            {/* <Ionicons name="settings" size={32} color="#fff" style={styles.icon} /> */}
            <Text style={styles.buttonText}>{t("LanguageSettingsPage_en")}</Text>
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