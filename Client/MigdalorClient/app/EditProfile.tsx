import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView, Image, TextInput, TouchableOpacity, Modal, Alert} from "react-native";
import * as ImagePicker from 'expo-image-picker';

import ImageViewModal from '../components/ImageViewModal';


import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";
import { Card, H2, Paragraph, XStack, YStack } from 'tamagui';

import FlipButton from "../components/FlipButton";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Checkbox from "../components/CheckBox";
import { useTranslation } from "react-i18next";
import LabeledTextInput from "@/components/LabeledTextInput";
import { Globals } from "@/app/constants/Globals";

export default function Profile( { visible, onClose, onSubmit}: {visible: boolean; onClose: () => void; onSubmit: () => void; }) {
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
  //console.log("Direction is:", Globals.userSelectedDirection);
  //console.log(typeof(Globals.userSelectedDirection));

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null); // e.g., 'main' or 'extra'


  const hasUnsavedChanges = () =>
    itemName.trim() !== '' ||
    itemDescription.trim() !== '' ||
    mainImage !== null ||
    extraImage !== null;

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowConfirm(false);
    resetState();
    onClose();
  };

  const resetState = () => {
    setItemName('');
    setItemDescription('');
    setMainImage(null);
    setExtraImage(null);
  };

  const handleSave = () => {
    // Call API or context to update profile info
    console.log({
      partner,
      apartmentNumber,
      mobilePhone,
      email,
      arrivalYear,
      origin,
      profession,
      interests,
      aboutMe,


    });
  };

  const pickImage = async (setImage: (uri: string) => void) => {
      // ... (pickImage function remains the same as your last correct version with base64) ...
          const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
          const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          console.log('Media Library Permission Status:', libraryPermission.status);
          if (libraryPermission.status !== 'granted') {
              Alert.alert('Permission needed', 'Permission to access media library is required!');
              return;
          }
  
          if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
            Alert.alert('Permissions needed', 'Camera and Media Library permissions are required!');
            return;
          }
  
          Alert.alert(
            "Select Image Source",
            "Choose an option",
            [
              {
                text: "Take Photo",
                onPress: async () => {
                  let result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    quality: 0.75,
                    base64: true
                  });
                  if (!result.canceled && result.assets) {
                    let base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
                    setImage(base64Uri);
                  }
                },
              },
              {
                text: "Choose From Library",
                onPress: async () => {
                  console.log("Attempting to launch image library...");
                  try {
                    let result = await ImagePicker.launchImageLibraryAsync({
                       allowsEditing: true,
                       quality: 0.75,
                       base64: true,
                    });
                    if (!result.canceled && result.assets) {
                       let mimeType = result.assets[0].mimeType || 'image/jpeg';
                       let base64Uri = `data:${mimeType};base64,${result.assets[0].base64}`;
                       console.log("Image selected (base64):", base64Uri.substring(0, 50) + "...");
                       setImage(base64Uri);
                    }
                  } catch (error) {
                    console.error("Error launching image library:", error);
                    Alert.alert("Error", "Could not open image library.");
                  }
                },
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]
          );
    };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
    
      <View style={styles.wrapper}>
      {/* <View style={{ flex: 1}}> */}
      {/* <View style={styles.container}> */}
      

        {/* <ScrollView style={{ flex: 1 }}>  */}
        <ScrollView contentContainerStyle={styles.scroll}>
          
      
          {/* <Text style={styles.title}>{t("ProfileScreen_Title")}</Text> */}
          {/* <Text>{t("ProfileScreen_header")}</Text> */}


            {/* Profile Image & Name */}
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: "https://static.vecteezy.com/system/resources/thumbnails/026/266/484/small_2x/default-avatar-profile-icon-social-media-user-photo-image-vector.jpg" }} 
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileNameContainer}>
                {/* <Text style={styles.profileName}>Israelasdaasda sdasdsdasd Israeliasdas dasdasdasdasdasd Israeliasdasdas dasdasdasdas</Text>  */}
                <Text style={styles.profileName}>Israel Israeli</Text> 

            </View>

            <View style={styles.editableContainer}>
              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_partner")}
                value={partner}
                onChangeText={setPartner}
              />


              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_apartmentNumber")}
                value={apartmentNumber}
                onChangeText={setApartmentNumber}
                keyboardType="numeric"
              />


              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_mobilePhone")}
                value={mobilePhone}
                onChangeText={setMobilePhone}
                keyboardType="phone-pad"
              />

              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_email")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_arrivalYear")}
                value={arrivalYear}
                onChangeText={setArrivalYear}
                keyboardType="numeric"
              />

              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_origin")}
                value={origin}
                onChangeText={setOrigin}
              />

              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_profession")}
                value={profession}
                onChangeText={setProfession}
              />

              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_interests")}
                value={interests}
                onChangeText={setInterests}
              />
                
              <FloatingLabelInput
                style= {styles.inputContainer}
                alignRight={Globals.userSelectedDirection === "rtl"}
                label={t("ProfileScreen_aboutMe")}
                value={aboutMe}
                onChangeText={setAboutMe}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
              />





              <Text style={[styles.label, { textAlign: Globals.userSelectedDirection === "rtl" ? "right" : "left" }]}>{t("ProfileScreen_extraImages")}</Text>
              <XStack space="$3" justifyContent="center" alignItems="center" marginVertical="$4">
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
              </XStack>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>{t("EditProfileScreen_saveButton")}</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
});