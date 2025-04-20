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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  // !! Switch these with the values from the database

  const [form, setForm] = useState({
    name: "",
    partner: "",
    apartmentNumber: "",
    mobilePhone: "",
    email: "",
    arrivalYear: "",
    origin: "",
    profession: "",
    interests: "",
    aboutMe: "",
    // profilePicID: "",
    // additionalPic1ID: "",
    // additionalPic2ID: "",
    residentApartmentNumber: "",
  });

  const [profilePic, setProfilePic] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
  });

  const [additionalPic1, setAdditionalPic1] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
  });

  const [additionalPic2, setAdditionalPic2] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
    //UploaderID: "",
    //PicRole: "",
    //ListingID: "",
    //DateTime: "",
  });



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

  // On mount, try to load the user data from AsyncStorage.
  useEffect(() => {
    const loadUserProfileData = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        console.log("Stored user ID:", storedUserID); // Debugging line
        if (storedUserID) {
          //const apiurl = `${Globals.API_BASE_URL}/api/People/{id}`;
          const apiurl = `${Globals.API_BASE_URL}/api/People/GetPersonByIDForProfile/${storedUserID}`; // !! check this is the  correct endpoint
          const response = await fetch(apiurl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            //body: JSON.stringify({ phoneNumber, password }),
          });

          if (!response.ok) {
            // You can throw an error or handle it with an error message.
            throw new Error(`Login failed: HTTP ${response.status}`);
          }

          const userData = await response.json();

          console.log("User data:", userData);

          // !! now to load the data into the form
          setForm({
            apartmentNumber: userData.apartmentNumber,
            mobilePhone: userData.phoneNumber,
            email: userData.email,
            arrivalYear: new Date(userData.dateOfArrival).getFullYear(),
            origin: userData.homePlace,
            profession: userData.profession,
            interests: userData.interests,
            aboutMe: userData.residentDescription,
            //profilePicID: userData.profilePicID,
            //additionalPic1ID: userData.additionalPic1ID,
            //additionalPic2ID: userData.additionalPic2ID,
            residentApartmentNumber: userData.residentApartmentNumber,
          });

          setProfilePic({
            PicID: userData.profilePicID,
            PicName: userData.profilePicName,
            PicPath: userData.profilePicPath,
            PicAlt: userData.profilePicAlt,
          });
          setAdditionalPic1({
            PicID: userData.additionalPic1ID,
            PicName: userData.additionalPic1Name,
            PicPath: userData.additionalPic1Path,
            PicAlt: userData.additionalPic1Alt,
          });
          setAdditionalPic2({
            PicID: userData.additionalPic2ID,
            PicName: userData.additionalPic2Name,
            PicPath: userData.additionalPic2Path,
            PicAlt: userData.additionalPic2Alt,
          });

          if (Globals.userSelectedLanguage === "he") {
            setForm((prev) => ({
              ...prev,
              name: userData.hebName,
              partner: userData.spouseHebName,
            }));
          } else if (Globals.userSelectedLanguage === "en") {
            setForm((prev) => ({
              ...prev,
              name: userData.engName,
              partner: userData.spouseEngName,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading user data from storage", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfileData(); // Call the function to load user data
  }, []);

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
            alt = {profilePic.PicAlt}
            source={{
              uri: profilePic.PicPath?.trim()
                ? API_BASE_URL + profilePic.PicPath
                : "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.profileNameContainer}>
          {/* <Text style={styles.profileName}>Israelasdaasda sdasdsdasd Israeliasdas dasdasdasdasdasd Israeliasdasdas dasdasdasdas</Text>  */}

          {/* !! Change this to full name  */}
          <Text style={styles.profileName}>{form.name || t("ProfileScreen_emptyDataField")}</Text>
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
          {form.residentApartmentNumber || t("ProfileScreen_emptyDataField")}
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
              uri: form.additionalPic1ID?.trim()
                ? form.additionalPic1ID
                : "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.extraImage}
          />
          <Image
            source={{
              uri: form.additionalPic2ID?.trim()
                ? form.additionalPic2ID
                : "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
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
