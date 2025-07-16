import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import { Globals } from "@/app/constants/Globals";
import { useAuth } from "@/context/AuthProvider";
import FlipButton from "@/components/FlipButton";
import BouncyButton from "@/components/BouncyButton";

const defaultUserImage = require("../assets/images/defaultUser.png");

export default function InstructorProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { userId: paramUserId } = useLocalSearchParams();
  

  const [form, setForm] = useState({
    name: "",
    mobilePhone: "",
    email: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfileData = async () => {
        setLoading(true);

        try {
          // Determine which user ID to fetch: the one from params or the logged-in user
          const loggedInUserId = authUser?.id;
          const userIdToFetch = paramUserId || loggedInUserId;

          if (!userIdToFetch) {
            console.warn("No user ID to fetch profile for.");
            if (isActive) setLoading(false);
            return;
          }
          
          // Use the correct API endpoint that accepts a user ID
          const response = await fetch(
            `${Globals.API_BASE_URL}/api/People/InstructorDetails/${userIdToFetch}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch instructor details");
          }

          const data = await response.json();

          if (isActive) {
            // The API returns slightly different field names here
            const nameToDisplay = Globals.userSelectedLanguage === 'he' 
              ? data.hebName 
              : data.engName;
            setForm({
              name: nameToDisplay || "",
              mobilePhone: data.phoneNumber || "",
              email: data.email || "",
            });
            setProfilePic(data.profilePicture);
          }
        } catch (error) {
          console.error("Error fetching instructor profile:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadProfileData();

      return () => {
        isActive = false;
      };
    }, [paramUserId, authUser]) // Re-run if the user ID in the param changes
  );

  

  const profileImageSource =
    profilePic && profilePic.picPath
      ? { uri: `${Globals.API_BASE_URL}${profilePic.picPath}` }
      : defaultUserImage;

    const loggedInUserId = authUser?.id;
    const viewingUserId = paramUserId || loggedInUserId;
    const isOwnProfile = loggedInUserId && viewingUserId && loggedInUserId === viewingUserId;
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t("Common_Loading")}</Text>
      </View>
    );
  }

  const renderField = (label, value) => {
    // Check the global direction variable
    const isRtl = Globals.userSelectedDirection === 'rtl';
    
    return (
      <>
        <Text style={[styles.label, { textAlign: isRtl ? 'right' : 'left' }]}>
            {label}
        </Text>
        
        {/* Apply conditional text alignment to the value box */}
        <Text style={[styles.box, { textAlign: isRtl ? 'right' : 'left' }]}>
          {value || t("ProfileScreen_emptyDataField")}
        </Text>
      </>
    );
  };

  // Add this function inside your InstructorProfile component
  const handleImagePress = (imageUriToView, altText = "") => {
    if (!imageUriToView || imageUriToView === defaultUserImage) return; 

    const paramsToPass = {
      imageUri: imageUriToView.uri,
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        
        {isOwnProfile && (
          <FlipButton
            onPress={() => router.push({
                pathname: '/InstructorEditProfile',
                params: {
                    initialData: JSON.stringify(form),
                    initialPic: JSON.stringify(profilePic)
                }
            })}
            bgColor="white"
            textColor="black"
            style={styles.editProfileButton}
          >
            <Text style={styles.editProfileButtonText}>
              {t("ProfileScreen_editButton")}
            </Text>
          </FlipButton>
        )}

        <View style={styles.profileImageContainer}>
          <BouncyButton
            shrinkScale={0.95}
            onPress={() => handleImagePress(profileImageSource, profilePic?.picAlt)}
            disabled={profileImageSource === defaultUserImage}
          >
            <Image
              alt={profilePic?.picAlt || "Profile picture"}
              source={profileImageSource}
              style={styles.profileImage}
            />
          </BouncyButton>
        </View>

        <View style={styles.profileNameContainer}>
          <Text style={styles.profileName}>
            {form.name || t("ProfileScreen_emptyDataField")}
          </Text>
        </View>

        {renderField(t("ProfileScreen_mobilePhone"), form.mobilePhone)}
        {renderField(t("ProfileScreen_email"), form.email)}

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
  scroll: {
    alignItems: "center",
    paddingBottom: 60,
    paddingTop: 80,
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
    width: "100%",
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 20,
    width: "80%",
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
});
