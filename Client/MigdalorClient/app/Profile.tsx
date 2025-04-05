import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";

function Profile() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1}}>
    {/* <View style={styles.container}> */}

      <ScrollView style={{ flex: 1 }}> 
        
    
        {/* <Text style={styles.title}>{t("ProfileScreen_Title")}</Text> */}
        <Text>{t("ProfileScreen_header")}</Text>


      </ScrollView>
    </View>
  );
}