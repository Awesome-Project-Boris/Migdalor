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

export default function EditProfile() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const { initialData } = route.params;

  const router = useRouter();

  // !! Switch these with the values from the database
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

  const maxLengths = {
    partner: 100,
    apartmentNumber: 10,
    mobilePhone: 20,
    email: 100,
    arrivalYear: 4,
    origin: 100,
    profession: 100,
    interests: 200,
    aboutMe: 300,
  };

  const [formErrors, setFormErrors] = useState({});

  const inputRefs = {
    partner: useRef(null),
    apartmentNumber: useRef(null),
    mobilePhone: useRef(null),
    email: useRef(null),
    arrivalYear: useRef(null),
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

      case "apartmentNumber":
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

      case "arrivalYear":
        return value.trim() === "" || /^\d{4}$/.test(value)
          ? null
          : t("EditProfileScreen_errorMessageArrivalYear");

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

  const handleSave = () => {
    const newErrors = {};
    let firstErrorField = null;

    const cleanedForm = {};

    Object.entries(form).forEach(([key, value]) => {
      const cleanedValue = value.trim().length === 0 ? "" : value.trim();
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
    alert(t("EditProfileScreen_ProfileUpdated"));

    // !! Add API call to save the data here

    router.push({
      pathname: "./Profile",
      params: {
        updatedData: JSON.stringify(form),
      },
    });
  };

  const handleCancel = () => {
    console.log("Cancelled Edit Profile");
    
    try {
      const parsedInitialData = JSON.parse(initialData); 
      setForm(parsedInitialData); 

      alert(t("EditProfileScreen_ProfileUpdateCancelled"));
  
      router.push({
        pathname: "./Profile",
        params: {
          updatedData: JSON.stringify(parsedInitialData), 
        },
      });
    } catch (err) {
      console.warn("Failed to parse initialData during cancel:", err);
      // You can fallback to just navigating without data
      router.push("./Profile");
    }
  };

  useEffect(() => { // Update the form with initialData
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData);
        setForm(parsedData);
      } catch (err) {
        console.warn("Failed to parse initialData:", err);
      }
    }
  }, [initialData]);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />

        {/* !! Add changing profile picture */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg",
            }}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.profileNameContainer}>
          {/* !! Change this to full name  */}
          <Text style={styles.profileName}>Israel Israeli</Text>
        </View>

        <View style={styles.editableContainer}>
          <FloatingLabelInput
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
          )}

          <FloatingLabelInput
            maxLength={maxLengths.apartmentNumber}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_apartmentNumber")}
            value={form.apartmentNumber}
            onChangeText={(text) => handleFormChange("apartmentNumber", text)}
            keyboardType="numeric"
            ref={inputRefs.apartmentNumber}
          />
          {formErrors.apartmentNumber && (
            <Text style={styles.errorText}>{formErrors.apartmentNumber}</Text>
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
            maxLength={maxLengths.arrivalYear}
            style={styles.inputContainer}
            alignRight={Globals.userSelectedDirection === "rtl"}
            label={t("ProfileScreen_arrivalYear")}
            value={form.arrivalYear}
            onChangeText={(text) => handleFormChange("arrivalYear", text)}
            keyboardType="numeric"
            ref={inputRefs.arrivalYear}
          />
          {formErrors.arrivalYear && (
            <Text style={styles.errorText}>{formErrors.arrivalYear}</Text>
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
            multiline
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
            multiline
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

          {/* !! Add extra images here */}


          {/* <XStack space="$3" justifyContent="center" alignItems="center" marginVertical="$4">
              <Card
                elevate width={150} height={150} borderRadius="$4" overflow="hidden"
                onPress={() => {
                  if (mainImage) {
                    console.log("clicking main.. setting type 'main'");
                    setImageToViewUri(mainImage);
                    // --- Set the identifier string ---
                    setImageTypeToClear('main');
                    setShowImageViewModal(true);
                  } else {
                    pickImage(setMainImage);
                  }
                }}
              >

                {mainImage ? ( 
                    <>
                    <Card.Background>
                      <Image source={{ uri: mainImage }} position="absolute" top={0} left={0} right={0} bottom={0} contentFit="cover"/>
                    </Card.Background>
                    <YStack f={1} jc="center" ai="center" backgroundColor="rgba(0,0,0,0.4)">
                      <Paragraph theme="alt2">Main image chosen</Paragraph>
                    </YStack>
                    </>
                  ) : (
                  <YStack f={1} jc="center" ai="center" p="$2">
                    <H2 size="$5">No Main Image</H2>
                    <Paragraph theme="alt2">Tap to choose</Paragraph>
                  </YStack>
                )}
              </Card>

              <Card
                elevate width={150} height={150} borderRadius="$4" overflow="hidden"
                onPress={() => {
                  if (extraImage) {
                    console.log("clicking extra.. setting type 'extra'");
                    setImageToViewUri(extraImage);
                    setImageTypeToClear('extra');
                    setShowImageViewModal(true);
                  } else {
                    pickImage(setExtraImage);
                  }
                }}
              >
                {extraImage ? ( 
                    <>
                    <Card.Background>
                      <Image source={{ uri: extraImage }} position="absolute" top={0} left={0} right={0} bottom={0} contentFit="cover"/>
                    </Card.Background>
                    <YStack f={1} jc="center" ai="center" backgroundColor="rgba(0,0,0,0.4)">
                      <Paragraph theme="alt2" color="$color">Extra image chosen</Paragraph>
                    </YStack>
                    </>
                  ) : ( 
                  <YStack f={1} jc="center" ai="center" p="$2">
                    <H2 size="$5">No Extra Image</H2>
                    <Paragraph theme="alt2">Tap to choose</Paragraph>
                  </YStack>
                )}
              </Card>
            </XStack> */}
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
    paddingTop: 100,
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
    height: 80,
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
    marginTop: 10,
  },
  editableContainer: {
    alignItems: "center",
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
