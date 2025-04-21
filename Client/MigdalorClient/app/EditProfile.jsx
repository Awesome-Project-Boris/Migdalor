import React, { useEffect, useState, useRef, forwardRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { Toast } from "toastify-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BouncyButton from "@/components/BouncyButton";


import ImageViewModal from "../components/ImageViewModal";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { Card, H2, Paragraph, XStack, YStack } from "tamagui";

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";
import LabeledTextInput from "@/components/LabeledTextInput";
import { Globals } from "@/app/constants/Globals";
const defaultUserImage = require("../assets/images/defaultUser.png");

export default function EditProfile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const { initialData, initialPics } = route.params;

  const router = useRouter();

  // !! Switch these with the values from the database
  const [form, setForm] = useState({
    name: "",
    partner: "",
    mobilePhone: "",
    email: "",
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

  const maxLengths = {
    partner: 100,
    residentApartmentNumber: 10,
    mobilePhone: 20,
    email: 100,
    origin: 100,
    profession: 100,
    interests: 200,
    aboutMe: 300,
  };

  const [formErrors, setFormErrors] = useState({});

  const inputRefs = {
    partner: useRef(null),
    residentApartmentNumber: useRef(null),
    mobilePhone: useRef(null),
    email: useRef(null),
    origin: useRef(null),
    profession: useRef(null),
    interests: useRef(null),
    aboutMe: useRef(null),
  };

  const regexHebrewEnglish = /^[\u0590-\u05FFa-zA-Z\s\-'.(),:\/]+$/;
  const regexHebrewEnglishNumbers = /^[\u0590-\u05FFa-zA-Z0-9\s\-'.(),:\/]+$/;

  const handleFormChange = (name, value) => {
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    console.log('Updated "' + name + '" to: "' + value + '"');
    console.log("Updated Data:", form);
  };

  const validateField = (name, value) => {
    const max = maxLengths[name];
    if (max && value.length > max) {
      return `${name} must be at most ${max} characters.`;
    }

    switch (name) {
      case "partner":
        return value.trim() === "" || regexHebrewEnglish.test(value)
          ? null
          : t("EditProfileScreen_errorMessagePartner");

      case "residentApartmentNumber":
        return value.trim() === "" || /^[0-9]+$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageApartmentNumber");

      case "mobilePhone":
        return value.trim() === "" || /^0\d{9}$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageMobilePhone");

      case "email":
        return value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageEmail");

      case "origin":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageOrigin");

      case "profession":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageProfession");

      case "interests":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageInterests");

      case "aboutMe":
        return value.trim() === "" || regexHebrewEnglishNumbers.test(value)
          ? null
          : t("EditProfileScreen_errorMessageAboutMe");

      default:
        return null;
    }
  };

  const handleSave = async () => {
    //form.arrivalYear = String(form.arrivalYear);

    // console.log("interests" , typeof form.interests);
    // console.log("aboutMe" , typeof form.aboutMe);
    // console.log("partner" , typeof form.partner);
    // console.log("residentApartmentNumber" , typeof form.residentApartmentNumber);
    // console.log("mobilePhone" , typeof form.mobilePhone);
    // console.log("email" , typeof form.email);
    // console.log("origin" , typeof form.origin);
    // console.log("profession" , typeof form.profession);
    // console.log("arrivalYear" , typeof form.arrivalYear);

    //console.log("form", form);

    const newErrors = {};
    let firstErrorField = null;

    const cleanedForm = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "arrivalYear") {
        return;
      }

      const str = value == null ? "" : String(value);
      const cleanedValue = str.trim(); // safe now
      cleanedForm[key] = cleanedValue;

      const error = validateField(key, cleanedValue);
      newErrors[key] = error;
      if (!firstErrorField && error) {
        firstErrorField = key;
      }
    });

    setFormErrors(newErrors);

    if (firstErrorField) {
      const ref = inputRefs[firstErrorField];
      if (ref?.current) {
        // Blur first to make sure that even if the input is focused, it will auto scroll to it
        ref.current.blur();
        setTimeout(() => {
          ref.current?.focus();
        }, 10);
      }
      return;
    }

    setForm(cleanedForm);
    console.log("Updated Data:", cleanedForm);
    //alert(t("EditProfileScreen_ProfileUpdated"));
    Toast.show({
      type: "success", // Type for styling (if themes are set up)
      text1: t("EditProfileScreen_ProfileUpdated"),
      //text1: 'Submitted!', // Main text
      //text2: t("EditProfileScreen_ProfileUpdated"), // Sub text
      duration: 3500, // Custom duration
      position: "top", // Example: 'top' or 'bottom'
    });

    //console.log(cleanedForm.residentApartmentNumber)

    // !! Add API call to save the data here
    console.log("Saving data to API...");
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      console.log("Stored user ID:", storedUserID); // Debugging line
      if (!storedUserID) {
        console.error("No user ID found in AsyncStorage.");
        return;
      }

      console.log("user:", storedUserID);
      cleanedForm.residentApartmentNumber = parseInt(
        cleanedForm.residentApartmentNumber
      );
      form.residentApartmentNumber = parseInt(form.residentApartmentNumber);
      console.log(typeof cleanedForm.residentApartmentNumber);
      console.log(typeof form.residentApartmentNumber);

      console.log(cleanedForm);
      const apiurl = `${Globals.API_BASE_URL}/api/People/UpdateProfile/${storedUserID}`; // !! check this is the  correct endpoint
      const response = await fetch(apiurl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ phoneNumber, password }),
        body: JSON.stringify({
          ...cleanedForm,
          //profilePic,
          //additionalPic1,
          //additionalPic2,
        }),
      });

      console.log("body:");
      console.log({
        ...cleanedForm,
        profilePic,
        additionalPic1,
        additionalPic2,
      });

      console.log("response:", response);

      if (!response.ok) {
        // You can throw an error or handle it with an error message.
        throw new Error(`Login failed: HTTP ${response.status}`);
      }

      //router.back({
      //router.replace({
      //   pathname: "./Profile",
      //   params: {
      //     //updatedData: JSON.stringify(form),
      //     updatedData: JSON.stringify(cleanedForm),
      //     updatedPics: JSON.stringify({
      //       profilePic,
      //       additionalPic1,
      //       additionalPic2,
      //     }),
      //   },
      // });
      router.back();
    } catch (error) {
      console.error("Error getting userID", error);
    }
  };

  const handleCancel = () => {
    console.log("Cancelled Edit Profile");

    try {
      const parsedInitialData = JSON.parse(initialData);
      const parsedInitialPics = JSON.parse(initialPics);

      setForm(parsedInitialData);
      setProfilePic(parsedInitialPics.profilePic);
      setAdditionalPic1(parsedInitialPics.additionalPic1);
      setAdditionalPic2(parsedInitialPics.additionalPic2);

      //alert(t("EditProfileScreen_ProfileUpdateCancelled"));
      Toast.show({
        type: "info", // Type for styling (if themes are set up)
        text1: t("EditProfileScreen_ProfileUpdateCancelled"),
        //text1: 'Submitted!', // Main text
        //text2: t("EditProfileScreen_ProfileUpdated"), // Sub text
        duration: 3500, // Custom duration
        position: "top", // Example: 'top' or 'bottom'
      });

      //router.back({
      //router.replace({
      //   pathname: "./Profile",
      //   params: {
      //     updatedData: JSON.stringify(parsedInitialData),
      //     updatedPics: JSON.stringify({
      //       profilePic: parsedInitialPics.profilePic,
      //       additionalPic1: parsedInitialPics.additionalPic1,
      //       additionalPic2: parsedInitialPics.additionalPic2,
      //     }),
      //   },
      // });
      router.back();
    } catch (err) {
      console.warn("Failed to parse initialData during cancel:", err);
      // You can fallback to just navigating without data

      //router.replace("./Profile");
      router.back();
    }
  };

  useEffect(() => {
    // Update the form with initialData
    if (initialData) {
      const parsedData = JSON.parse(initialData);
      setForm(parsedData);
    }
    if (initialPics) {
      const pics = JSON.parse(initialPics);
      setProfilePic(pics.profilePic);
      setAdditionalPic1(pics.additionalPic1);
      setAdditionalPic2(pics.additionalPic2);
    }
  }, [initialData, initialPics]);

  // Construct the full image URL if mainImagePath exists, otherwise use placeholder
  const imageUrl = profilePic.PicPath?.trim()
    ? { uri: `${Globals.API_BASE_URL}${profilePic.PicPath}` }
    : defaultUserImage;

  const additionalImage1 = additionalPic1.PicPath?.trim()
    ? { uri: `${Globals.API_BASE_URL}${additionalPic1.PicPath}` }
    : defaultUserImage;

  const additionalImage2 = additionalPic2.PicPath?.trim()
    ? { uri: `${Globals.API_BASE_URL}${additionalPic2.PicPath}` }
    : defaultUserImage;

  const handleImagePress = (imageUriToView, altText = "") => {
    if (!imageUriToView) {
      console.log("handleImagePress: No valid imageUri provided.");
      return;
    }
    console.log("handleImagePress: imageUriToView:", imageUriToView);

    // if (imageUriToView === Globals.API_BASE_URL) {
    //   console.log("handleImagePress: No valid imageUri provided.");
    //   return;
    // }

    const paramsToPass = {
      imageUri: imageUriToView,
      altText: altText,
    };

    console.log("Navigating to ImageViewScreen with params:", paramsToPass);

    router.push({
      pathname: "/ImageViewScreen",
      params: paramsToPass,
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Header />

        {/* !! Add changing profile picture */}
        <View style={styles.profileImageContainer}>
          {/* <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.profileImage}
          /> */}
          <BouncyButton
            shrinkScale={0.95}
            onPress={() =>
              handleImagePress(
                Globals.API_BASE_URL + profilePic.PicPath,
                profilePic.PicAlt
              )
            }
            disabled={!(Globals.API_BASE_URL + profilePic.PicPath)}
          >
            <Image
              alt={profilePic.PicAlt}
              source={imageUrl}
              style={styles.profileImage}
            />
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          {/* !! Change this to full name  */}
          <Text style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </Text>
        </View>

        <View style={styles.editableContainer}>
          {/* <FloatingLabelInput
            maxLength={maxLengths.partner}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_partner")}
            name="partner"
            value={form.partner}
            onChangeText={(text) => handleFormChange("partner", text)}
            ref={inputRefs.partner}
          />
          {formErrors.partner && (
            <Text style={styles.errorText}>{formErrors.partner}</Text>
          )} */}

          <FloatingLabelInput
            maxLength={maxLengths.residentApartmentNumber}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_apartmentNumber")}
            value={String(form.residentApartmentNumber)}
            onChangeText={(text) =>
              handleFormChange("residentApartmentNumber", text)
            }
            keyboardType="numeric"
            ref={inputRefs.residentApartmentNumber}
          />
          {formErrors.residentApartmentNumber && (
            <Text style={styles.errorText}>
              {formErrors.residentApartmentNumber}
            </Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.mobilePhone}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_mobilePhone")}
            value={form.mobilePhone}
            onChangeText={(text) => handleFormChange("mobilePhone", text)}
            keyboardType="phone-pad"
            ref={inputRefs.mobilePhone}
          />
          {formErrors.mobilePhone && (
            <Text style={styles.errorText}>{formErrors.mobilePhone}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.email}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_email")}
            value={form.email}
            onChangeText={(text) => handleFormChange("email", text)}
            keyboardType="email-address"
            ref={inputRefs.email}
          />
          {formErrors.email && (
            <Text style={styles.errorText}>{formErrors.email}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.origin}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_origin")}
            value={form.origin}
            onChangeText={(text) => handleFormChange("origin", text)}
            ref={inputRefs.origin}
          />
          {formErrors.origin && (
            <Text style={styles.errorText}>{formErrors.origin}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.profession}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_profession")}
            value={form.profession}
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            onChangeText={(text) => handleFormChange("profession", text)}
            ref={inputRefs.profession}
          />
          {formErrors.profession && (
            <Text style={styles.errorText}>{formErrors.profession}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.interests}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_interests")}
            value={form.interests}
            onChangeText={(text) => handleFormChange("interests", text)}
            ref={inputRefs.interests}
            //multiline
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            numberOfLines={4}
          />
          {formErrors.interests && (
            <Text style={styles.errorText}>{formErrors.interests}</Text>
          )}

          <FloatingLabelInput
            maxLength={maxLengths.aboutMe}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_aboutMe")}
            value={form.aboutMe}
            onChangeText={(text) => handleFormChange("aboutMe", text)}
            ref={inputRefs.aboutMe}
            multiline={true}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
            numberOfLines={6}
            textAlignVertical="top"
          />
          {formErrors.aboutMe && (
            <Text style={styles.errorText}>{formErrors.aboutMe}</Text>
          )}

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
            <BouncyButton
              shrinkScale={0.95}
              onPress={() =>
                handleImagePress(
                  Globals.API_BASE_URL + additionalPic1.PicPath,
                  additionalPic1.PicAlt
                )
              }
              disabled={!(Globals.API_BASE_URL + additionalPic1.PicPath)}
            >
              <Image
                alt={additionalPic1.PicAlt}
                source={additionalImage1}
                style={styles.profileImage}
              />
            </BouncyButton>

            <BouncyButton
              shrinkScale={0.95}
              onPress={() =>
                handleImagePress(
                  Globals.API_BASE_URL + additionalPic2.PicPath,
                  additionalPic2.PicAlt
                )
              }
              disabled={!(Globals.API_BASE_URL + additionalPic2.PicPath)}
            >
              <Image
                alt={additionalPic2.PicAlt}
                source={additionalImage2}
                style={styles.profileImage}
              />
            </BouncyButton>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <FlipButton
            onPress={handleSave}
            bgColor="white"
            textColor="black"
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {t("EditProfileScreen_saveButton")}
            </Text>
          </FlipButton>

          <FlipButton
            onPress={handleCancel}
            bgColor="white"
            textColor="black"
            style={styles.cancelButton}
          >
            <Text style={styles.saveButtonText}>
              {t("EditProfileScreen_cancelButton")}
            </Text>
          </FlipButton>
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
    alignSelf: "center",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 40,
    gap: 20,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButtonText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
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
  editableContainer: {
    pointerEvents: "box-none",
    alignItems: "center",
    //alignSelf: "center",
    width: "100%",
    marginTop: 30,
    gap: 30,
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

  buttonLabel: { fontSize: 20, fontWeight: "bold" },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginTop: -30,
    fontSize: 28,
    width: "90%",
    textAlign: "center",
  },
});
