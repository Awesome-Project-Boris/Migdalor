import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView, Image, TextInput, TouchableOpacity} from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";
import LabeledTextInput from "@/components/LabeledTextInput";
import { Globals } from "@/app/constants/Globals";

export default function Profile() {
  const { t } = useTranslation();
  
  // !! Switch these with the values from the database
  const [partner, setPartner] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [email, setEmail] = useState("");
  const [arrivalYear, setArrivalYear] = useState("");
  const [origin, setOrigin] = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests] = useState("");
  const [aboutMe, setAboutMe] = useState("");

  return (
    <View style={styles.wrapper}>
    {/* <View style={{ flex: 1}}> */}
    {/* <View style={styles.container}> */}
    

      {/* <ScrollView style={{ flex: 1 }}>  */}
      <ScrollView contentContainerStyle={styles.scroll}>
        
    
        {/* <Text style={styles.title}>{t("ProfileScreen_Title")}</Text> */}
        {/* <Text>{t("ProfileScreen_header")}</Text> */}
        <Text style={styles.title}>{t("ProfileScreen_header")}</Text>


          {/* Profile Image & Name */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg" }} 
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Israel Israeli</Text> 
          </View>

          <FloatingLabelInput
            style={ styles.inputContainer}
            label={t("ProfileScreen_partner")}
            value={partner}
            onChangeText={setPartner}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_apartmentNumber")}
            value={apartmentNumber}
            onChangeText={setApartmentNumber}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_mobilePhone")}
            value={mobilePhone}
            onChangeText={setMobilePhone}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_email")}
            value={email}
            onChangeText={setEmail}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_arrivalYear")}
            value={arrivalYear}
            onChangeText={setArrivalYear}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_origin")}
            value={origin}
            onChangeText={setOrigin}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_profession")}
            value={profession}
            onChangeText={setProfession}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_interests")}
            value={interests}
            onChangeText={setInterests}
            multiline
            textInputHeight={100}
          />

          <FloatingLabelInput
            style={ styles.inputContainer }
            label={t("ProfileScreen_aboutMe")}
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            textInputHeight={100}
          />



          






      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#fff0da",
  },
  scroll: {
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileName: {
    fontSize: 16,
    marginTop: 5,
  },
  inputContainer: {
    width: "85%",
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 40,
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
  },
  extraImages: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
  },
  extraImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginTop: 20,
  },
  saveText: {
    fontSize: 18,
  },
});