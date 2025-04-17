import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";
import LabeledTextInput from "@/components/LabeledTextInput";
import { Globals } from "@/app/constants/Globals";

export default function Profile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  // !! Switch these with the values from the database

  // const [partner, setPartner] = useState("");
  // const [apartmentNumber, setApartmentNumber] = useState("");
  // const [mobilePhone, setMobilePhone] = useState("");
  // const [email, setEmail] = useState("");
  // const [arrivalYear, setArrivalYear] = useState("");
  // const [origin, setOrigin] = useState("");
  // const [profession, setProfession] = useState("");
  // const [interests, setInterests] = useState("");
  // const [aboutMe, setAboutMe] = useState("");

  const [form, setForm] = useState({
    partner: "",
    apartmentNumber: "",
    mobilePhone: "",
    email: "",
    arrivalYear: "",
    origin: "",
    profession: "",
    interests: "",
    aboutMe: "",
  });

  // const handleProfileUpdate = (updatedData: {
  //   partner: string;
  //   apartmentNumber: string;
  //   mobilePhone: string;
  //   email: string;
  //   arrivalYear: string;
  //   origin: string;
  //   profession: string;
  //   interests: string;
  //   aboutMe: string;
  // }) => {
  //   setForm(updatedData);
  // };

  const params = useLocalSearchParams();
  useEffect(() => {
    const updated = params.updatedData;

    if (typeof updated === "string") {
      try {
        const parsed = JSON.parse(updated);
        setForm(parsed);
      } catch (err) {
        console.warn("Failed to parse updatedData:", err);
      }
    }
  }, [params.updatedData]);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        {/* !! Add check if profileID == userID */}
        <FlipButton
          onPress={() =>
            router.push({
              pathname: "./EditProfile",
              params: {
                initialData: JSON.stringify(form),
              },
            })
          }
          bgColor="white"
          textColor="black"
          style={styles.editProfileButton}
        >
          <Text style={styles.editProfileButtonText}>
            {t("ProfileScreen_editButton")}
          </Text>
        </FlipButton>

        <View style={styles.profileImageContainer}>
          {/* !! Change this to users profile picture */}
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.profileNameContainer}>
          {/* <Text style={styles.profileName}>Israelasdaasda sdasdsdasd Israeliasdas dasdasdasdasdasd Israeliasdasdas dasdasdasdas</Text>  */}

          {/* !! Change this to full name  */}
          <Text style={styles.profileName}>Israel Israeli</Text>
        </View>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_partner")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.partner || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_apartmentNumber")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.apartmentNumber || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_mobilePhone")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.mobilePhone || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_email")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.email || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_arrivalYear")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.arrivalYear || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_origin")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.origin || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_profession")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.profession || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_interests")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.interests || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_aboutMe")}
        </Text>
        <Text
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {form.aboutMe || t("ProfileScreen_emptyDataField")}
        </Text>

        <Text
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {t("ProfileScreen_extraImages")}
        </Text>
        <View style={styles.profileExtraImageContainer}>
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.extraImage}
          />
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.extraImage}
          />
        </View>
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
    paddingBottom: 60,
    paddingTop: 80,
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
    width: 300,
    height: 300,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileNameContainer: {
    bottom: 60,
    alignItems: "center",
    borderRadius: 70,
    paddingVertical: 12,
    marginBottom: -40,
    width: "80%",
    backgroundColor: "#fff",
    borderColor: "#000000",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileName: {
    opacity: 0.9,
    padding: 10,
    fontWeight: "bold",
    fontSize: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // maxWidth: "90%", // 💡 prevent overflow
    // flexWrap: "wrap", // allow long names to wrap
    width: "100%",
    textAlign: "center",
  },
  inputContainer: {
    width: "85%",
    marginVertical: 5,
  },
  // label: {
  //   fontSize: 14,
  //   marginBottom: 5,
  //   textAlign: "right",
  // },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 40,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  extraImages: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
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
  label: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 20,
    width: "80%",
    // marginLeft: 50,
    // marginRight: 50,
  },
  box: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 30,
  },
  extraImage: {
    width: 300,
    height: 300,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 40,
  },
  profileExtraImageContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "75%",
    marginTop: 10,
  },
  // extraImage: {
  //   width: 300,
  //   height: 300,
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   borderColor: "#ddd",
  //   marginHorizontal: 5,
  //   backgroundColor: "#fff",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 2,
  //   elevation: 3, // for Android shadow
  //   marginBottom: 30,
  // },
  editProfileButton: {
    paddingVertical: 20,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  editProfileButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
});
