import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import FlipButton from "@/components/FlipButton";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";
import { Globals } from "../app/constants/Globals";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function ImageHistory({
  visible,
  picRole,
  onClose,
  onSelect,
  picturesInUse = [],
  clearedPictureIds = [],
}) {
  const [pictures, setPictures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [maxSlots, setMaxSlots] = useState(0);

  const fetchImageHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userID");
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User ID not found.",
        });
        return onClose();
      }
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Picture/history`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserId: userId,
            Role:
              picRole === "Profile picture"
                ? "profile_picture"
                : "secondary_profile",
          }),
        }
      );
      if (!response.ok)
        throw new Error(`Server responded with status: ${response.status}`);
      const data = await response.json();
      const picturesWithFullPaths = data.map((pic) => ({
        ...pic,
        url: `${Globals.API_BASE_URL}${pic.picPath}`,
      }));
      setPictures(picturesWithFullPaths);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Load History",
        text2: error.message,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [picRole, onClose]);

  useEffect(() => {
    if (visible && picRole) {
      if (picRole === "Profile picture") {
        setTitle("Your Profile Pictures");
        setMaxSlots(5);
      } else {
        setTitle("Your Extra Pictures");
        setMaxSlots(3);
      }
      fetchImageHistory();
    }
  }, [visible, picRole, fetchImageHistory]);

  const handleSelectPicture = async (picture) => {
    try {
      const userId = await AsyncStorage.getItem("userID");
      const response = await fetch(
        `${Globals.API_BASE_URL}/api/Picture/select`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserId: userId, PicId: picture.picId }),
        }
      );
      if (!response.ok)
        throw new Error(
          `Failed to update picture timestamp. Status: ${response.status}`
        );
      const updatedPicture = await response.json();
      const objectToSend = {
        PicID: updatedPicture.picId,
        PicPath: updatedPicture.picPath,
        PicName: updatedPicture.picName,
        PicAlt: updatedPicture.picAlt,
        UploaderId: updatedPicture.uploaderId,
        PicRole: updatedPicture.picRole,
        DateTime: updatedPicture.dateTime,
      };
      onSelect(objectToSend);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Selection Failed",
        text2: error.message,
      });
    }
  };

  const handleDelete = (pictureId) => {
    const isCurrentlyInUse =
      picturesInUse.includes(pictureId) &&
      !clearedPictureIds.includes(pictureId);
    if (isCurrentlyInUse) {
      Toast.show({
        type: "warning",
        text1: "Cannot Delete",
        text2: "This picture is currently in use on your profile edit screen.",
        duration: 4000,
      });
      return;
    }
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem("userID");
              const apiRole =
                picRole === "Profile picture"
                  ? "profile_picture"
                  : "secondary_profile";
              const response = await fetch(
                `${Globals.API_BASE_URL}/api/Picture/delete`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    UserId: userId,
                    PicId: pictureId,
                    Role: apiRole,
                  }),
                }
              );
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || `Server error: ${response.status}`
                );
              }
              setPictures((prev) => prev.filter((p) => p.picId !== pictureId));
              Toast.show({ type: "success", text1: "Picture Deleted" });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Deletion Failed",
                text2: "The picture is currently in use",
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const pickAndUploadImage = async (source) => {
    let result;
    if (source === "camera") {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert("Permission denied", "Camera access is required.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
    } else {
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryPermission.status !== "granted") {
        Alert.alert("Permission denied", "Gallery access is required.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
    }

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setIsLoading(true);

    try {
      const uploaderId = await AsyncStorage.getItem("userID");
      const imageUri = result.assets[0].uri;
      const formData = new FormData();
      const fileType = imageUri.split(".").pop();
      formData.append("files", {
        uri: imageUri,
        name: `upload.${fileType}`,
        type: `image/${fileType}`,
      });
      const apiRole =
        picRole === "Profile picture" ? "profile_picture" : "secondary_profile";
      formData.append("picRoles", apiRole);
      formData.append("picAlts", picRole);
      formData.append("uploaderId", uploaderId);
      const response = await fetch(`${Globals.API_BASE_URL}/api/Picture`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Upload failed: ${errorBody}`);
      }
      Toast.show({ type: "success", text1: "Upload Successful!" });
      fetchImageHistory();
    } catch (error) {
      console.error("Upload failed:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    Alert.alert("Add a New Photo", "Choose a source for your new picture.", [
      { text: "Camera", onPress: () => pickAndUploadImage("camera") },
      { text: "Gallery", onPress: () => pickAndUploadImage("gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderSlot = (slotIndex) => {
    const picture = pictures[slotIndex];
    if (picture) {
      const isCurrentlyInUse =
        picturesInUse.includes(picture.picId) &&
        !clearedPictureIds.includes(picture.picId);
      return (
        <View key={picture.picId} style={styles.slotContainer}>
          <ExpoImage
            source={{ uri: picture.url }}
            style={styles.image}
            contentFit="cover"
          />
          {isCurrentlyInUse && <View style={styles.inUseOverlay} />}
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              style={[styles.iconButtonBase, styles.selectButton]}
              onPress={() => handleSelectPicture(picture)}
            >
              <Ionicons name="checkmark-circle" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButtonBase, styles.deleteButton]}
              onPress={() => handleDelete(picture.picId)}
            >
              <Ionicons name="trash" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          key={`empty-${slotIndex}`}
          style={styles.emptySlot}
          onPress={handleAddPhoto}
        >
          <Ionicons name="image-outline" size={50} color="#a0a0a0" />
          <StyledText style={styles.addPhotoText}>Add Photo</StyledText>
        </TouchableOpacity>
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- CHANGE: Header is now inside the ScrollView --- */}
          <View style={styles.header}>
            <StyledText style={styles.title}>{title}</StyledText>
            <StyledText style={styles.subtitle}>
              You can manage up to {maxSlots} pictures.
            </StyledText>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <View style={styles.grid}>
              {Array.from({ length: maxSlots }).map((_, index) =>
                renderSlot(index)
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <FlipButton onPress={onClose} style={styles.returnButton}>
            <StyledText style={styles.returnButtonText}>Return</StyledText>
          </FlipButton>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f4f4f8",
  },
  scrollContent: {
    // This allows content to align center in the scroll view
    alignItems: "center",
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "transparent", // Header background is now part of the main view
    width: "100%", // Ensure it takes full width within scrollview
    alignItems: "center",
    marginBottom: 10, // Add space between header and grid
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1c1c1e",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
    color: "#6c6c6e",
  },
  grid: {
    width: "100%",
    alignItems: "center", // Center the single column of photos
  },
  slotContainer: {
    marginVertical: 15, // Increased vertical margin for spacing
    borderRadius: 15,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    backgroundColor: "white",
  },
  image: {
    // --- CHANGE: Image size increased ---
    width: width * 0.8,
    height: width * 0.8,
  },
  inUseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 3,
    borderColor: "#007bff",
    borderRadius: 15,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  iconButtonBase: {
    padding: 8,
    borderRadius: 30,
  },
  selectButton: {
    backgroundColor: "rgba(40, 167, 69, 0.8)",
  },
  deleteButton: {
    backgroundColor: "rgba(220, 53, 69, 0.8)",
  },
  emptySlot: {
    // --- CHANGE: Empty slot size increased ---
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 15,
    marginVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderWidth: 2,
    borderColor: "#ced4da",
    borderStyle: "dashed",
  },
  addPhotoText: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 8,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  returnButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 14,
    borderColor: "#5a6268",
  },
  returnButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
