import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";
import FlipButton from "@/components/FlipButton"; // Using default import
import { Globals } from "../app/constants/Globals";
import * as ImagePicker from "expo-image-picker";

export default function ImageHistory({ visible, picRole, onClose, onSelect }) {
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
      onSelect({
        // Pass data back to EditProfile
        PicID: updatedPicture.picId,
        PicPath: updatedPicture.picPath,
        PicName: updatedPicture.picName,
        PicAlt: updatedPicture.picAlt,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Selection Failed",
        text2: error.message,
      });
    }
  };

  const handleDelete = (pictureId) => {
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
              if (!response.ok)
                throw new Error(
                  `Server responded with status ${response.status}`
                );
              setPictures((prev) => prev.filter((p) => p.picId !== pictureId));
              Toast.show({ type: "success", text1: "Picture Deleted" });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Deletion Failed",
                text2: error.message,
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleAddPhoto = async () => {
    Alert.alert("Add a New Photo", "Choose a source for your new picture.", [
      { text: "Camera", onPress: () => pickAndUploadImage("camera") },
      { text: "Gallery", onPress: () => pickAndUploadImage("gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
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
      return; // User cancelled the process
    }

    setIsLoading(true); // Show loading indicator during upload

    try {
      const uploaderId = await AsyncStorage.getItem("userID");
      const token = await AsyncStorage.getItem("userToken");
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
      formData.append("picAlts", picRole); // Use role as alt text for simplicity
      formData.append("uploaderId", uploaderId);

      const response = await fetch(`${Globals.API_BASE_URL}/api/Picture`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Upload failed: ${errorBody}`);
      }

      Toast.show({ type: "success", text1: "Upload Successful!" });
      fetchImageHistory(); // Refresh the history to show the new photo
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

  const renderSlot = (slotIndex) => {
    const picture = pictures[slotIndex];
    if (picture) {
      return (
        <View key={picture.picId} style={styles.slotContainer}>
          <Image source={{ uri: picture.url }} style={styles.image} />
          <View style={styles.buttonContainer}>
            <FlipButton
              frontText="Select"
              backText="Confirm"
              onPress={() => handleSelectPicture(picture)}
            />
            <TouchableOpacity
              onPress={() => handleDelete(picture.picId)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          key={slotIndex}
          style={styles.emptySlot}
          onPress={handleAddPhoto}
        >
          <Text style={styles.plusSign}>+</Text>
          <Text style={styles.addPhotoText}>Add Photo</Text>
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            You can manage up to {maxSlots} pictures.
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <View style={styles.grid}>
              {Array.from({ length: maxSlots }).map((_, index) =>
                renderSlot(index)
              )}
            </View>
          )}
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  slotContainer: {
    margin: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptySlot: {
    width: 150,
    height: 150,
    borderRadius: 10,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#c0c0c0",
    borderStyle: "dashed",
  },
  plusSign: {
    fontSize: 40,
    color: "#888",
  },
  addPhotoText: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  closeButton: {
    padding: 20,
    backgroundColor: "#007aff",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
