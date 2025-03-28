import { View } from "tamagui";
//import CheckboxDemo from "../../components/CheckBox";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Globals } from "@/app/constants/Globals";
import { useState, useEffect } from "react";
import { Slider, XStack, YStack, ZStack, Text, Image, styled } from "tamagui";




const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SoundSettingsPage() {
    // const [volumeSetting, setVolumeSetting] = useState(Globals.userVolumeSetting);
  
    // useEffect(() => {
    //   Globals.userVolumeSetting = volumeSetting;
    // }, [volumeSetting]);

  return (
    <View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}> 
        <YStack height={70} alignItems="baseline" gap="$5" alignSelf="center">

        </YStack>
      
      </ScrollView>
    </View>
  );
}
