import { View, Slider, XStack, YStack, Image, styled } from "tamagui";
import { useState } from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

// --- Custom Component and Context Imports ---
import { useSettings } from "@/context/SettingsContext.jsx";
import StyledText from "@/components/StyledText.jsx";

const SCREEN_WIDTH = Dimensions.get("window").width;

const CustomSliderTrack = styled(Slider.Track, {
<<<<<<< Updated upstream
  backgroundColor: "#00b5d9",
=======
  backgroundColor: "#00b5d9", // A distinct color for the slider track
>>>>>>> Stashed changes
});

export default function FontSettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- HEADER SECTION --- */}
        {/* The fixed height has been REMOVED from this YStack */}
        <YStack alignItems="center" gap="$2" marginBottom="$6">
          <StyledText style={styles.headerText}>
            {t("FontSettingsPage_header")}
          </StyledText>
        </YStack>

        {/* --- SLIDER SECTION --- */}
        <XStack
          alignItems="center"
          justifyContent="center"
          width="90%"
          alignSelf="center"
          gap="$3"
        >
          <Image
            source={{
              uri:
                settings.language === "he"
                  ? "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67f212ba&is=67f0c13a&hm=1b5416976411c76d5fa6911cb26ccd04e4c4bb69d5c813759e5264d4a7c27131&"
                  : "https://pngimg.com/d/letter_a_PNG24.png",
              width: 20,
              height: 20,
            }}
          />
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Slider
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
                <Slider.TrackActive />
              </CustomSliderTrack>
              <Slider.Thumb circular index={0} />
            </Slider>
          </View>
          <Image
            source={{
              uri:
                settings.language === "he"
                  ? "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67f212ba&is=67f0c13a&hm=1b5416976411c76d5fa6911cb26ccd04e4c4bb69d5c813759e5264d4a7c27131&"
                  : "https://pngimg.com/d/letter_a_PNG24.png",
              width: 50,
              height: 50,
            }}
          />
        </XStack>

        {/* --- EXAMPLE TEXT SECTION --- */}
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
    paddingVertical: 40, // Increased padding for better spacing
    paddingHorizontal: 10,
    marginTop: 60,
  },
  headerText: {
    fontSize: 32, // Slightly adjusted base size
    fontWeight: "800",
    textAlign: "center",
    color: "#333",
  },
  textBoxStyle: {
    fontSize: 16, // This is the base font size that will be multiplied
    backgroundColor: "#EFEFEF",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    textAlign: "center",
    color: "#333",
    // Adding overflow: 'hidden' can prevent text from rendering outside the box boundaries
    overflow: "hidden",
  },
});
