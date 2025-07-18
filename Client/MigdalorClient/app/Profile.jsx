import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";

import { useSettings } from "@/context/SettingsContext";

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
import StyledText from "@/components/StyledText";

const defaultUserImage = require("../assets/images/defaultUser.png");

const getApartmentNumberFromGuid = (guid) => {
  if (!guid || typeof guid !== "string") {
    return "";
  }
  // This logic finds the 'A' and parses the number that follows.
  const parts = guid.toUpperCase().split("A");
  const numberPart = parts.pop();
  if (numberPart && !isNaN(parseInt(numberPart, 10))) {
    return String(parseInt(numberPart, 10));
  }
  return ""; // Return empty string if format is unexpected or invalid
};

export default function Profile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const localSearchParams = useLocalSearchParams();

  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;

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

  const formattedArrivalDate = useMemo(() => {
    if (form.arrivalYear) {
      try {
        const date = new Date(form.arrivalYear);
        // Check if the date is valid before formatting
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB"); // Formats to DD/MM/YYYY
        }
      } catch (error) {
        console.error("Could not format date:", form.arrivalYear, error);
      }
      // Fallback to original string if it's not a valid date
      return form.arrivalYear;
    }
    return "";
  }, [form.arrivalYear]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadUserProfileData = async () => {
        setLoading(true); // Set loading at the start
        try {
          const storedUserID = await AsyncStorage.getItem("userID");
          if (isActive) {
            setLoggedInUserId(storedUserID);
          }
          const userIdToFetch = localSearchParams.userId || storedUserID;
          if (!userIdToFetch) {
            console.warn("No user ID to fetch profile for.");
            if (isActive) setLoading(false);
            return;
          }
          if (isActive) {
            setViewingUserId(userIdToFetch);
          }
          const apiurl = `${Globals.API_BASE_URL}/api/People/details/${userIdToFetch}`;
          console.log("Attempting to fetch from URL:", apiurl);
          const response = await fetch(apiurl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch profile: HTTP ${response.status}`);
          }
          const userData = await response.json();

          const apartmentDisplayNumber = getApartmentNumberFromGuid(
            userData.residentApartmentNumber
          );

          if (!isActive) return;
          setForm({
            mobilePhone: userData.phoneNumber || "",
            email: userData.email || "",
            arrivalYear: userData.dateOfArrival || "",
            origin: userData.homePlace || "",
            profession: userData.profession || "",
            interests:
              userData.residentInterests?.map((interest) => interest.name) ||
              [],
            aboutMe: userData.residentDescription || "",
            residentApartmentNumber: apartmentDisplayNumber || "",
          });
          console.log(
            "userData.profilePicture looking for image:",
            userData.profilePicture
          );
          setProfilePic(
            userData.profilePicture ?? {
              PicID: null,
              PicName: "",
              PicPath: "",
              PicAlt: "",
            }
          );
          setAdditionalPic1(
            userData.additionalPicture1 ?? {
              PicID: null,
              PicName: "",
              PicPath: "",
              PicAlt: "",
            }
          );
          setAdditionalPic2(
            userData.additionalPicture2 ?? {
              PicID: null,
              PicName: "",
              PicPath: "",
              PicAlt: "",
            }
          );

          setPrivacySettings(
            userData.privacySettings ?? {
              showPartner: true,
              showApartmentNumber: true,
              showMobilePhone: true,
              showEmail: true,
              showArrivalYear: true,
              showOrigin: true,
              showProfession: true,
              showInterests: true,
              showAboutMe: true,
              showProfilePicture: true,
              showAdditionalPictures: true,
            }
          );

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
          console.error("Error loading user data:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadUserProfileData();
      return () => {
        isActive = false;
      };
    }, [localSearchParams.userId])
  );
  const isOwnProfile =
    loggedInUserId && viewingUserId && loggedInUserId === viewingUserId;
  const isVisible = (fieldKey) => {
    if (isOwnProfile) return true;
    if (!privacySettings) return true;
    return privacySettings[fieldKey];
  };

  // New check to see if the profile is fully private

  const isProfilePrivate =
    privacySettings &&
    !isOwnProfile &&
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
    const hasPath = picData && picData.picPath && picData.picPath.trim();
    if (isPicVisible && hasPath) {
      return { uri: `${Globals.API_BASE_URL}${picData.picPath}` };
    }
    return defaultUserImage;
  };

  const profileImageSource = getImageUrl(
    profilePic,
    isVisible("showProfilePicture")
  );
  const additionalImage1Source = getImageUrl(
    additionalPic1,
    isVisible("showAdditionalPictures")
  );
  const additionalImage2Source = getImageUrl(
    additionalPic2,
    isVisible("showAdditionalPictures")
  );

  const handleImagePress = (imageUriToView, altText = "") => {
    // if (!imageUriToView || imageUriToView === Globals.API_BASE_URL) {
    //   console.log("handleImagePress: No valid imageUri provided.");
    //   return;
    // }

    if (!imageUriToView || imageUriToView === defaultUserImage) return; // Don't open modal for default image
    console.log("handleImagePress: imageUriToView:", imageUriToView);

    // if (imageUriToView === Globals.API_BASE_URL) {
    //   console.log("handleImagePress: No valid imageUri provided.");
    //   return;
    // }
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
        <StyledText>{t("Common_Loading")}</StyledText>
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
            <StyledText style={styles.profileName}>
              {form.name || t("ProfileScreen_emptyDataField")}
            </StyledText>
          </View>
          <StyledText style={styles.privateText}>
            {t("ProfileScreen_privateProfile")}
          </StyledText>
        </ScrollView>
      </View>
    );
  }

  const renderField = (fieldKey, label, value) => {
    if (!isVisible(fieldKey)) return null;
    return (
      <>
        <StyledText
          style={[
            styles.label,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {label}
        </StyledText>
        <StyledText
          style={[
            styles.box,
            {
              textAlign:
                Globals.userSelectedDirection === "rtl" ? "right" : "left",
            },
          ]}
        >
          {value || t("ProfileScreen_emptyDataField")}
        </StyledText>
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
            <StyledText style={styles.editProfileButtonText}>
              {t("ProfileScreen_editButton")}
            </StyledText>
          </FlipButton>
        )}
        {/* This block will now show the default image if the profile picture is private */}
        <View style={styles.profileImageContainer}>
          {/* !! Change this to users profile picture */}

          <BouncyButton
            shrinkScale={0.95}
            onPress={() =>
              handleImagePress(profileImageSource, profilePic.PicAlt)
            }
            //disabled={!profilePic.PicPath?.trim()}
            disabled={profileImageSource === defaultUserImage}
          >
            <Image
              alt={profilePic.PicAlt || "Profile picture"}
              source={profileImageSource}
              style={styles.profileImage}
            />
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          {/* <StyledText style={styles.profileName}>Israelasdaasda sdasdsdasd Israeliasdas dasdasdasdasdasd Israeliasdasdas dasdasdasdas</StyledText>  */}

          {/* !! Change this to full name  */}
          <StyledText style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </StyledText>
        </View>

        {renderField("showPartner", t("ProfileScreen_partner"), form.partner)}
        {renderField(
          "showApartmentNumber",
          t("ProfileScreen_apartmentNumber"),
          form.residentApartmentNumber
        )}
        {renderField(
          "showMobilePhone",
          t("ProfileScreen_mobilePhone"),
          form.mobilePhone
        )}
        {renderField("showEmail", t("ProfileScreen_email"), form.email)}
        {renderField(
          "showArrivalYear",
          t("ProfileScreen_arrivalYear"),
          formattedArrivalDate
        )}
        {renderField("showOrigin", t("ProfileScreen_origin"), form.origin)}
        {renderField(
          "showProfession",
          t("ProfileScreen_profession"),
          form.profession
        )}
        {isVisible("showInterests") && (
          <>
            <StyledText
              style={[
                styles.label,
                {
                  textAlign:
                    Globals.userSelectedDirection === "rtl" ? "right" : "left",
                },
              ]}
            >
              {t("ProfileScreen_interests")}
            </StyledText>
            <View style={styles.chipContainer}>
              {form.interests && form.interests.length > 0 ? (
                form.interests.map((interestName) => (
                  <InterestChip
                    key={interestName}
                    mode="display"
                    label={interestName}
                  />
                ))
              ) : (
                <StyledText
                  style={{
                    ...styles.noInterestsText,
                    width: "100%", // Ensures the component fills the container
                    textAlign:
                      Globals.userSelectedDirection === "rtl"
                        ? "right"
                        : "left", // Correctly aligns the text
                  }}
                >
                  {t("ProfileScreen_emptyDataField")}
                </StyledText>
              )}
            </View>
          </>
        )}
        {renderField("showAboutMe", t("ProfileScreen_aboutMe"), form.aboutMe)}
        {isVisible("showAdditionalPictures") && (
          <>
            <StyledText
              style={[
                styles.label,
                {
                  textAlign:
                    Globals.userSelectedDirection === "rtl" ? "right" : "left",
                },
              ]}
            >
              {t("ProfileScreen_extraImages")}
            </StyledText>
            <View
              style={[
                styles.profileExtraImageContainer,
                useColumnLayout && styles.extraImagesColumn,
              ]}
            >
              <BouncyButton
                onPress={() =>
                  handleImagePress(
                    additionalImage1Source,
                    additionalPic1.PicAlt
                  )
                }
                //disabled={!additionalPic1.PicPath?.trim()}
                disabled={additionalImage1Source === defaultUserImage}
              >
                <Image
                  alt={additionalPic1?.PicAlt || "Extra picture 1"}
                  source={additionalImage1Source}
                  style={[
                    styles.extraImage,
                    useColumnLayout && styles.largeImage,
                  ]}
                />
              </BouncyButton>
              <BouncyButton
                onPress={() =>
                  handleImagePress(
                    additionalImage2Source,
                    additionalPic2.PicAlt
                  )
                }
                //disabled={!additionalPic2.PicPath?.trim()}
                disabled={additionalImage2Source === defaultUserImage}
              >
                <Image
                  alt={additionalPic2?.PicAlt || "Extra picture 2"}
                  source={additionalImage2Source}
                  style={[
                    styles.extraImage,
                    useColumnLayout && styles.largeImage,
                  ]}
                />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  privateText: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  largeImage: {
    width: 300,
    height: 300,
    borderRadius: 60,
  },
});
