//import CheckboxDemo from "../../components/CheckBox";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Globals } from "@/app/constants/Globals";
import { useState, useEffect } from "react";
import { View, Slider, XStack, YStack, ZStack, Text, Image, styled } from "tamagui";
import FlipButton from "../../components/FlipButton";
import Header from "@/components/Header";
import { Divider } from 'react-native-paper';
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";


const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function LanguageSettingsPage() {
  const {t, i18n} = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();

  const [languageSetting, setLanguageSetting] = useState(Globals.userSelectedLanguage);

  useEffect(() => {
    Globals.userSelectedLanguage = languageSetting;
    Globals.userSelectedDirection = (languageSetting == "he" ? "rtl" : "ltr");
    console.log("Direction: " + Globals.userSelectedDirection);
    //console.log("Language setting: " + languageSetting);
    i18n.changeLanguage(languageSetting);
  }, [languageSetting]);


  return (
    <View style={{ flex: 1 }} >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60, paddingTop: 60  }}> 
        <Header />
        <YStack height={150} alignItems="baseline" gap="$5" alignSelf="center">

        <Text
            fontSize={40}
            marginTop={10}
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

          <Divider/>

          <Text
            fontSize={40}
            marginTop={10}
            fontWeight={800}
            alignSelf="center"
            // direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}
          >
            {t("LanguageSettingsPage_LogoutHeader")}
          </Text>
            <FlipButton
              style={styles.button}
              bgColor="#ffffff"
              textColor="#0b0908"
              onPress={async () => {
                console.log("Logging out...");
                await logout();
                router.replace("/LoginScreen");
                      Toast.show({
                        type: "success",
                        text1: t("LanguageSettingsPage_LogoutToast"),
                        // duration: 3500,
                        position: "top",
                      });

              }}
            >
              <Text style={styles.buttonText}>{t("LanguageSettingsPage_Logout")}</Text>
            </FlipButton>            
        </YStack>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({

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