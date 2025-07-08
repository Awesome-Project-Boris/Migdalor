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
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
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
import { G } from "react-native-svg";
import BouncyButton from "@/components/BouncyButton";
import InterestChip from "../components/InterestChip";

const defaultUserImage = require("../assets/images/defaultUser.png");

export default function Profile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    partner: "",
    mobilePhone: "",
    email: "",
    arrivalYear: "",
    origin: "",
    profession: "",
    interests: "",
    aboutMe: "",
    residentApartmentNumber: "",
  });

  const [profilePic, setProfilePic] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [additionalPic1, setAdditionalPic1] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [additionalPic2, setAdditionalPic2] = useState({
    PicID: "",
    PicName: "",
    PicPath: "",
    PicAlt: "",
  });

  const [privacySettings, setPrivacySettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

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

            if (!isActive) return;
            // populate form & pics exactly as before…
            if (userData.residentApartmentNumber === null) {
              userData.residentApartmentNumber = "";
            }

            // if(userData.phoneNumber === null) {
            //   userData.phoneNumber = "";
            // }

            // !! now to load the data into the form
            setForm({
              //apartmentNumber: userData.apartmentNumber,
              mobilePhone: userData.phoneNumber,
              email: userData.email,
              //arrivalYear: new Date(userData.dateOfArrival).getFullYear(),
              arrivalYear: userData.dateOfArrival,
              origin: userData.homePlace,
              profession: userData.profession,
              interests: userData.residentInterests.map(
                (interest) => interest.name
              ),
              aboutMe: userData.residentDescription,
              residentApartmentNumber: String(userData.residentApartmentNumber),
            });

            setProfilePic({
              PicID: userData.profilePicture?.picId ?? null,
              PicName: userData.profilePicture?.picName ?? "",
              PicPath: userData.profilePicture?.picPath ?? "",
              PicAlt: userData.profilePicture?.picAlt ?? "",
            });


          setAdditionalPic1({
            PicID: userData.additionalPicture1?.picId ?? null,
            PicName: userData.additionalPicture1?.picName ?? "",
            PicPath: userData.additionalPicture1?.picPath ?? "",
            PicAlt: userData.additionalPicture1?.picAlt ?? "",
          });

          setAdditionalPic2({
            PicID: userData.additionalPicture2?.picId ?? null,
            PicName: userData.additionalPicture2?.picName ?? "",
            PicPath: userData.additionalPicture2?.picPath ?? "",
            PicAlt: userData.additionalPicture2?.picAlt ?? "",
          });

          setPrivacySettings(userData.privacySettings ?? {
            showPartner: true, showApartmentNumber: true, showMobilePhone: true,
            showEmail: true, showArrivalYear: true, showOrigin: true,
            showProfession: true, showInterests: true, showAboutMe: true,
            showProfilePicture: true, showAdditionalPictures: true,
            });

          if (Globals.userSelectedLanguage === "he") {
            setForm((prev) => ({
              ...prev,
              name: userData.hebName || "",
              partner: userData.spouseHebName || "",
            }));
          } else if (Globals.userSelectedLanguage === "en") {
            setForm((prev) => ({
              ...prev,
              name: userData.engName || "",
              partner: userData.spouseEngName || "",
            }));
          }
        } catch (error) {
          console.error("Error loading user data from storage", error);
        } finally {
          setLoading(false);
        }
      };

      loadUserProfileData(); // Call the function to load user data
      return () => {
        isActive = false;
      };
    }, [])
  );
  const isOwnProfile = loggedInUserId && viewingUserId && (loggedInUserId === viewingUserId);
  const isVisible = (fieldKey) => {
    if (isOwnProfile) return true;
    if (!privacySettings) return true;
    return privacySettings[fieldKey];
  };

  // New check to see if the profile is fully private

  const isProfilePrivate = privacySettings && !isOwnProfile &&
    !privacySettings.showProfilePicture &&
    !privacySettings.showAdditionalPictures &&
    !privacySettings.showPartner &&
    !privacySettings.showApartmentNumber &&
    !privacySettings.showMobilePhone &&
    !privacySettings.showEmail &&
    !privacySettings.showArrivalYear &&
    !privacySettings.showOrigin &&
    !privacySettings.showProfession &&
    !privacySettings.showInterests &&
    !privacySettings.showAboutMe;

  // Determine the correct image source based on privacy settings
  const getImageUrl = (picData, isPicVisible) => {
      const hasPath = picData && picData.PicPath && picData.PicPath.trim();
      if (isPicVisible && hasPath) {
          return { uri: `${Globals.API_BASE_URL}${picData.PicPath}` };
      }
      return defaultUserImage;
  };

  const profileImageSource = getImageUrl(profilePic, isVisible('showProfilePicture'));
  const additionalImage1Source = getImageUrl(additionalPic1, isVisible('showAdditionalPictures'));
  const additionalImage2Source = getImageUrl(additionalPic2, isVisible('showAdditionalPictures'));

  const handleImagePress = (imageUriToView, altText = "") => {
    // if (!imageUriToView || imageUriToView === Globals.API_BASE_URL) {
    //   console.log("handleImagePress: No valid imageUri provided.");
    //   return;
    // }

    if (!imageUriToView || imageUriToView === defaultUserImage) return; // Don't open modal for default image
    console.log("handleImagePress: imageUriToView:", imageUriToView);

    if (imageUriToView === Globals.API_BASE_URL) {
      console.log("handleImagePress: No valid imageUri provided.");
      return;
    }

    const paramsToPass = {
      imageUri: imageUriToView.uri, // !! make sure to pass the URI correctly
      //imageUri: imageUriToView,
      altText: altText,
    };

    console.log("Navigating to ImageViewScreen with params:", paramsToPass);

    router.push({
      pathname: "/ImageViewScreen",
      params: paramsToPass,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t("Common_Loading")}</Text>
      </View>
    );
  }
  // If the profile is fully private, render a special component

  if (isProfilePrivate) {
    return (
        <View style={styles.wrapper}>
            <Header />
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileImageContainer}>
                    <Image source={defaultUserImage} style={styles.profileImage} />
                </View>
                <View style={styles.profileNameContainer}>
                    <Text style={styles.profileName}>
                        {form.name || t("ProfileScreen_emptyDataField")}
                    </Text>
                </View>
                <Text style={styles.privateText}>{t('ProfileScreen_privateProfile')}</Text>
            </ScrollView>
        </View>
    );
  }

  const renderField = (fieldKey, label, value) => {
    if (!isVisible(fieldKey)) return null;
    return (
      <>
        <Text style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>
          {label}
        </Text>
        <Text style={[styles.box, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>
          {value || t("ProfileScreen_emptyDataField")}
        </Text>
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />

        {isOwnProfile && (
          <FlipButton
            onPress={() =>
              router.push({
                pathname: "./EditProfile",
                params: {
                  initialData: JSON.stringify(form),
                  initialPics: JSON.stringify({
                    profilePic,
                    additionalPic1,
                    additionalPic2,
                  }),
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
        )}
        {/* This block will now show the default image if the profile picture is private */}
        <View style={styles.profileImageContainer}>
          {/* !! Change this to users profile picture */}

          <BouncyButton
            shrinkScale={0.95}
            onPress={() =>
              handleImagePress(
                profileImageSource,
                profilePic.PicAlt
              )
            }
            //disabled={!profilePic.PicPath?.trim()}
            disabled={profileImageSource === defaultUserImage}
          >
            <Image
              alt={profilePic.PicAlt || "Profile picture"}
              source={profileImageSource }
              style={styles.profileImage}
            />
          </BouncyButton>
        </View>
        

        <View style={styles.profileNameContainer}>
          {/* <Text style={styles.profileName}>Israelasdaasda sdasdsdasd Israeliasdas dasdasdasdasdasd Israeliasdasdas dasdasdasdas</Text>  */}

          {/* !! Change this to full name  */}
          <Text style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </Text>
        </View>
        
        {renderField('showPartner', t("ProfileScreen_partner"), form.partner)}
        {renderField('showApartmentNumber', t("ProfileScreen_apartmentNumber"), form.residentApartmentNumber)}
        {renderField('showMobilePhone', t("ProfileScreen_mobilePhone"), form.mobilePhone)}
        {renderField('showEmail', t("ProfileScreen_email"), form.email)}
        {renderField('showArrivalYear', t("ProfileScreen_arrivalYear"), form.arrivalYear)}
        {renderField('showOrigin', t("ProfileScreen_origin"), form.origin)}
        {renderField('showProfession', t("ProfileScreen_profession"), form.profession)}
        {isVisible('showInterests') && (
            <>
                <Text style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>
                    {t("ProfileScreen_interests")}
                </Text>
                <View style={styles.chipContainer}>
                {form.interests && form.interests.length > 0 ? (
                    form.interests.map((interestName) => (
                    <InterestChip key={interestName} mode="display" label={interestName} />
                    ))
                ) : (
                    <Text style={styles.noInterestsText}>{t("ProfileScreen_emptyDataField")}</Text>
                )}
                </View>
            </>
        )}
        {renderField('showAboutMe', t("ProfileScreen_aboutMe"), form.aboutMe)}
        {isVisible('showAdditionalPictures') && (
            <>
                <Text style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>
                    {t("ProfileScreen_extraImages")}
                </Text>
                <View style={styles.profileExtraImageContainer}>
                  <BouncyButton onPress={() => handleImagePress(additionalImage1Source, additionalPic1.PicAlt)} 
                  //disabled={!additionalPic1.PicPath?.trim()}
                  disabled={additionalImage1Source === defaultUserImage}>
                      <Image alt={additionalPic1.PicAlt || "Extra picture 1"} source={additionalImage1Source} style={styles.profileImage}/>
                  </BouncyButton>
                  <BouncyButton onPress={() => handleImagePress(additionalImage2Source, additionalPic2.PicAlt)} 
                    //disabled={!additionalPic2.PicPath?.trim()}
                    disabled={additionalImage2Source === defaultUserImage}>
                      <Image alt={additionalPic2.PicAlt || "Extra picture 2"} source={additionalImage2Source} style={styles.profileImage}/>
                  </BouncyButton>
                </View>
            </>
        )}
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
    marginTop: 20,
    gap: 30,
  },
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
  chipContainer: {
    width: "85%",
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    minHeight: 50,
  },
  noInterestsText: {
    color: "#666",
    fontStyle: "italic",
    padding: 5,
  },
  privateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  privateText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});
