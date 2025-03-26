import { View } from "tamagui";
import type { SliderProps } from 'tamagui'
import { Slider, XStack, YStack, ZStack, Text, Image, styled,  } from 'tamagui'
import { useState, useEffect } from 'react'
import { StyleSheet, Dimensions, ScrollView } from 'react-native'
import { Bold, Scroll } from "@tamagui/lucide-icons";
import { Globals } from "../constants/Globals";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSharedValue } from 'react-native-reanimated';
import { Slider as AwesomeSlider } from 'react-native-awesome-slider';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const CustomSliderTrack = styled(Slider.Track, {
  backgroundColor: '#d40b0b7c',
})

export default function GeneralSettingsPage() {
  const [fontSize, setFontSize] = useState(Globals.userSelectedFontSize)
  const [scrollEnabled, setScrollEnabled] = useState(false)

  useEffect(() => {
    Globals.userSelectedFontSize = fontSize
  }, [fontSize])

  return (
    <View style={{ flex: 1 }}>
      <ScrollView scrollEnabled={scrollEnabled} style={{ flex: 1 }}>
        <YStack height={70} alignItems="baseline" gap="$5" alignSelf="center">
          <Text fontSize={40} fontWeight={800} alignSelf="center" direction={Globals.userSelectedDirection as 'rtl' | 'ltr'}>גודל טקסט:</Text>
        </YStack>

        <XStack height={80} width={SCREEN_WIDTH * 1} alignItems="baseline" gap="$3" alignSelf="center" justifyContent="center" direction="rtl">
          <Image 
            alignSelf="center"
            source={{
              uri: 'https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67e2e97a&is=67e197fa&hm=399800590e41b3c525eb29668dbc383634a34755fdaa97a20b329d40f0d48741&',
              width: 20,
              height: 20,
            }}
          />

          <TouchableWithoutFeedback onPressIn={() => {setScrollEnabled(false)}} onPressOut={() => {setScrollEnabled(true)}}>
            <Slider alignSelf="center" size="$4" width={SCREEN_WIDTH * 0.6} defaultValue={[fontSize]} max={3} step={1} onValueChange={(value) => setFontSize(3 - value[0])}>
              <CustomSliderTrack>
                <Slider.TrackActive />
              </CustomSliderTrack>
              <Slider.Thumb circular index={0} />
            </Slider>
            {/* <SliderExample /> */}
          </TouchableWithoutFeedback>

          <Image
            source={{
              uri: 'https://cdn.discordapp.com/attachments/1309914853548359740/1353784406338175066/Aleph.png?ex=67e2e97a&is=67e197fa&hm=399800590e41b3c525eb29668dbc383634a34755fdaa97a20b329d40f0d48741&',
              width: 50,
              height: 50,
            }}
          />
        </XStack>
        
        <YStack alignItems="baseline" gap="$5" alignSelf="center">
          <Text fontSize={40} fontWeight={800} alignSelf="center" direction={Globals.userSelectedDirection as "rtl"| "ltr"}>טקסט דוגמה:</Text>
          <Text style={[styles.textBoxStyle, { fontSize: (fontSize * 10) + 20 }]} alignSelf="center" direction={Globals.userSelectedDirection as 'rtl' | 'ltr'}>
  הקוסם מארץ עוץ:
  דורותי והכלב הקטן שלה טוטו גרו בכפר קטן באמריקה, דורותי אהבה מאוד את טוטו, והם היו משחקים אחד עם השניה כל הזמן.
  יום אחד היה סופת טורנדו נוראית. "אנחנו חייבים להגיע למרתף, טוטו!" קראה דורותי. אבל זה היה מאוחר מדי. הרוח החזקה והסוערת הרימה את בית החווה לאוויר ולקחה את דורותי וטוטו לארץ עוץ הנידחת.
          </Text>
        </YStack>
      </ScrollView>
    </View>
  )

}

const styles = StyleSheet.create({
  textBoxStyle: {
    //fontSize: 30,
    backgroundColor: '#ddd',
    padding: 20,
    borderRadius: 10,
  },
})

// export const SliderExample = () => {
//   const progress = useSharedValue(30);
//   const min = useSharedValue(0);
//   const max = useSharedValue(100);
//   return <AwesomeSlider progress={progress} minimumValue={min} maximumValue={max} />;
// };