import { View, Slider, XStack, YStack, Image, styled } from "tamagui";
import { useState } from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext.jsx";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = Dimensions.get("window").width;

const CustomSliderTrack = styled(Slider.Track, {
  backgroundColor: "#e0e0e0"
});

export default function FontSettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // --- Define the local image sources ---
  const hebrewIcon = require("@/assets/images/aHe.png");
  const englishIcon = require("@/assets/images/aEng.png");

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <YStack alignItems="center" gap="$2" marginBottom="$6">
          <StyledText style={styles.headerText}>
            {t("FontSettingsPage_header")}
          </StyledText>
        </YStack>

        <XStack
          alignItems="center"
          justifyContent="center"
          width="90%"
          alignSelf="center"
          gap="$3"
        >
          <Image
            source={settings.language === "he" ? hebrewIcon : englishIcon}
            style={{ width: 20, height: 20 }}
          />
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Slider
              dir="ltr"
              size="$6"
              width="100%"
              min={1}
              max={3}
              step={1}
              defaultValue={[settings.fontSizeMultiplier]}
              onValueChange={(value) =>
                updateSetting("fontSizeMultiplier", value[0])
              }
              onSlideStart={() => setScrollEnabled(false)}
              onSlideEnd={() => setScrollEnabled(true)}
            >
              <CustomSliderTrack>
                <Slider.TrackActive style={{ backgroundColor: "#00b5d9" }} />
              </CustomSliderTrack>
              <Slider.Thumb circular index={0} />
            </Slider>
          </View>
          <Image
            source={settings.language === "he" ? hebrewIcon : englishIcon}
            style={{ width: 50, height: 50 }}
          />
        </XStack>

        <YStack
          alignItems="center"
          gap="$3"
          alignSelf="center"
          marginTop="$8"
          width="90%"
        >
          <StyledText style={styles.headerText}>
            {t("FontSettingsPage_exampleHeader")}
          </StyledText>
          <StyledText
            style={styles.textBoxStyle}
            writingDirection={settings.language === "he" ? "rtl" : "ltr"}
          >
            {t("FontSettingsPage_example")}
          </StyledText>
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 10,
    marginTop: 60,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#333",
    lineHeight: 36,
    width: "100%",
  },
  textBoxStyle: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "#EFEFEF",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    textAlign: "center",
    color: "#333",
    overflow: "hidden",
  },
});