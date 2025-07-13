import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
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
        if (!authUser) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("jwt");
          const response = await fetch(
            `${Globals.API_BASE_URL}/api/People/InstructorDetails`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch instructor details");
          }

          const data = await response.json();

          if (isActive) {
            setForm({
              name: data.engName || data.hebName,
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
    }, [authUser])
  );

  const profileImageSource =
    profilePic && profilePic.picPath
      ? { uri: `${Globals.API_BASE_URL}${profilePic.picPath}` }
      : defaultUserImage;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t("Common_Loading")}</Text>
      </View>
    );
  }

  const renderField = (label, value) => {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.box}>
          {value || t("ProfileScreen_emptyDataField")}
        </Text>
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        
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

        <View style={styles.profileImageContainer}>
          <BouncyButton shrinkScale={0.95} disabled={true}>
            <Image source={profileImageSource} style={styles.profileImage} />
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
