import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Switch,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";

import { useSettings } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Globals } from "@/app/constants/Globals";
import StyledText from "./StyledText";
import FlipButton from "./FlipButton";

// CategoryItem component remains the same
const CategoryItem = ({ item, onToggle }) => {
  return (
    <View style={styles.itemContainer}>
      <StyledText style={styles.categoryName}>
        {item.categoryHebName}
      </StyledText>
      <Switch
        trackColor={{ false: "#cccccc", true: "#81b0ff" }}
        thumbColor={item.isSubscribed ? "#007AFF" : "#f4f3f4"}
        ios_backgroundColor="#cccccc"
        onValueChange={() => onToggle(item.categoryHebName, !item.isSubscribed)}
        value={item.isSubscribed}
      />
    </View>
  );
};

// The main component no longer accepts residentId as a prop
const CategorySettingsModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [residentId, setResidentId] = useState(null);

  const controllerName = "Resident";
  const updateSubscriptionAction = "subscriptions";

  useEffect(() => {
    const loadResidentId = async () => {
      if (visible) {
        // Fetches the ID directly from storage using the "userID" key
        const userIdFromStorage = await AsyncStorage.getItem("userID");
        console.log("Loaded userID from storage in modal:", userIdFromStorage);
        setResidentId(userIdFromStorage);
      } else {
        // Reset ID when the modal closes
        setResidentId(null);
      }
    };
    loadResidentId();
  }, [visible]); // Dependency is 'visible'

  // This useEffect fetches subscription data once we have the residentId
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // --- Debugging Logs ---
        console.log("Attempting to fetch. Current residentId:", residentId);
        const controllerName = "Resident"; // Ensure this is defined
        console.log("Using controller name:", controllerName);
        // ---

        const getSubscriptionsAction = `subscriptions/${residentId}`;
        const apiUrl = `${Globals.API_BASE_URL}/api/${controllerName}/${getSubscriptionsAction}`;
        console.log("Constructed API URL:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          // If the server returned an error, log the details
          const errorBody = await response.text();
          console.error(
            "Network response not OK. Status:",
            response.status,
            "Body:",
            errorBody
          );
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (e) {
        // THIS IS THE MOST IMPORTANT CHANGE: Log the actual error object
        console.error("An error occurred in fetchSubscriptions:", e);

        Alert.alert(
          t("CategorySettings_ErrorLoading_AlertTitle"),
          t("CategorySettings_ErrorLoading")
        );
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      setLoading(true);
      if (residentId) {
        fetchSubscriptions();
      }
    }
  }, [visible, residentId, t]);

  const handleToggle = useCallback(
    async (categoryHebName, newStatus) => {
      // Guard against toggling before ID is loaded
      if (!residentId) return;

      setCategories((prev) =>
        prev.map((cat) =>
          cat.categoryHebName === categoryHebName
            ? { ...cat, isSubscribed: newStatus }
            : cat
        )
      );
      try {
        const apiUrl = `${Globals.API_BASE_URL}/api/${controllerName}/${updateSubscriptionAction}`;
        await fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            residentId,
            categoryHebName,
            isSubscribed: newStatus,
          }),
        });

        Toast.show({
          type: "success",
          text1: t("CategorySettings_UpdateSuccess", "Preference Saved"),
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: t(
            "CategorySettings_ErrorUpdating_AlertTitle",
            "Update Failed"
          ),
          text2: t("CategorySettings_ErrorUpdating", "Please try again."),
        });

        // Revert on failure
        setCategories((prev) =>
          prev.map((cat) =>
            cat.categoryHebName === categoryHebName
              ? { ...cat, isSubscribed: !newStatus }
              : cat
          )
        );
      }
    },
    [residentId, t]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    return (
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem item={item} onToggle={handleToggle} />
        )}
        keyExtractor={(item) => item.categoryHebName}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.modalContainer,
          { direction: settings.language === "he" ? "rtl" : "ltr" },
        ]}
      >
        <View style={styles.header}>
          <StyledText type="title" style={styles.title}>
            {t("CategorySettings_Title")}
          </StyledText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={34} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <StyledText style={styles.subtitle}>
          {t("CategorySettings_Subtitle")}
        </StyledText>
        <View style={styles.listContainer}>{renderContent()}</View>
        <View style={styles.footer}>
          <FlipButton onPress={onClose}>
            <StyledText style={styles.buttonText}>
              {t("CategorySettings_Done")}
            </StyledText>
          </FlipButton>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#F2F2F7" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {},
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#6c6c70",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    right: 15,
  },
  listContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryName: {
    fontSize: 20,
  },
  separator: { height: 1, backgroundColor: "#E5E5EA", marginLeft: 20 },
  footer: { padding: 20, backgroundColor: "#F2F2F7" },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});

export default CategorySettingsModal;
