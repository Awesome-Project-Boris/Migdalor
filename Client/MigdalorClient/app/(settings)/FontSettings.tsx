import { View } from "tamagui";
import { Slider, XStack, YStack, ZStack, Text, Image, styled } from "tamagui";
import { Bold, Scroll } from "@tamagui/lucide-icons";
import { useState, useEffect } from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Globals } from "../constants/Globals";
import { Pressable, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const CustomSliderTrack = styled(Slider.Track, {
  backgroundColor: "#00b5d9",
});

export default function GeneralSettingsPage() {
  const {t} = useTranslation();

  const [fontSize, setFontSize] = useState(Globals.userSelectedFontSize);

  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    Globals.userSelectedFontSize = fontSize;
  }, [fontSize]);

  return (
    <View style={{ flex: 1 }}>
     <Header/> 
      <ScrollView scrollEnabled={scrollEnabled} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60, paddingTop: 60  }}> 
        <YStack height={70} alignItems="baseline" gap="$5" alignSelf="center">
          <Text
            fontSize={40}
            fontWeight={800}
            alignSelf="center"
            // direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}

          >
            {t("FontSettingsPage_header")}

          </Text>
        </YStack>

        <XStack
          height={80}
          width={SCREEN_WIDTH * 1}
          alignItems="baseline"
          gap="$4"
          alignSelf="center"
          justifyContent="center"
          direction="rtl"
        >
          <Image
            alignSelf="center"
            //alignSelf="baseline"
            
            // style={{ paddingLeft: 20 }}
            // style={{ alignItems: "flex-end" }}

            source={{
              //uri: "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67e2e97a&is=67e197fa&hm=399800590e41b3c525eb29668dbc383634a34755fdaa97a20b329d40f0d48741&",
              uri: Globals.userSelectedLanguage == "he" ? "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67f212ba&is=67f0c13a&hm=1b5416976411c76d5fa6911cb26ccd04e4c4bb69d5c813759e5264d4a7c27131&" : "https://pngimg.com/d/letter_a_PNG24.png",
              width: 20,
              height: 20,
            }}
          />

            <Slider
              alignSelf="center"
              size="$6"
              width={SCREEN_WIDTH * 0.6}
              defaultValue={[3- Globals.userSelectedFontSize]}
              max={3}
              step={1}
              onValueChange={(value) => setFontSize(3- value[0])}
              onSlideStart={() => {
                setScrollEnabled(false)
              }}
              onSlideEnd={() => {
                setScrollEnabled(true);
              }}
            >
              <CustomSliderTrack>
                <Slider.TrackActive />
              </CustomSliderTrack>
              <Slider.Thumb circular index={0} />
            </Slider>

          <Image
            source={{
              //uri: "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67e2e97a&is=67e197fa&hm=399800590e41b3c525eb29668dbc383634a34755fdaa97a20b329d40f0d48741&",
              uri: Globals.userSelectedLanguage == "he" ? "https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67f212ba&is=67f0c13a&hm=1b5416976411c76d5fa6911cb26ccd04e4c4bb69d5c813759e5264d4a7c27131&" : "https://pngimg.com/d/letter_a_PNG24.png",
              width: 50,
              height: 50,
            }}
          />
        </XStack>

        <YStack alignItems="baseline" gap="$5" alignSelf="center">
          <Text
            fontSize={40}
            fontWeight={800}
            alignSelf="center"
            // direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}

          >
            {t("FontSettingsPage_exampleHeader")}
          </Text>
          <Text
            style={[styles.textBoxStyle, { fontSize: fontSize * 10 + 20 }]}
            alignSelf="center"
            //direction={Globals.userSelectedDirection as "rtl" | "ltr"}
            writingDirection={Globals.userSelectedDirection as "rtl" | "ltr"}

          >
            {t("FontSettingsPage_example")}
          </Text>
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  textBoxStyle: {
    //fontSize: 30,
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 10,
  },
});

// export const SliderExample = () => {
//   const progress = useSharedValue(30);
//   const min = useSharedValue(0);
//   const max = useSharedValue(100);
//   return <AwesomeSlider progress={progress} minimumValue={min} maximumValue={max} />;
// };
