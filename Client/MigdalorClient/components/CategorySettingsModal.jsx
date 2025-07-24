import React, { useState, useEffect, useCallback, useContext } from "react";
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
// 🔽 Core project imports
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import Globals from "@/app/constants/Globals";
import StyledText from "./StyledText";
import FlipButton from "./FlipButton";

// A single item in our list, now fully accessible
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

const CategorySettingsModal = ({ visible, onClose, residentId }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const controllerName = "Resident";
  const getSubscriptionsAction = `subscriptions/${residentId}`;
  const updateSubscriptionAction = "subscriptions";

  // Fetch subscriptions when the modal becomes visible
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!residentId) return;
      try {
        setLoading(true);
        const apiUrl = `${Globals.API_BASE_URL}/api/${controllerName}/${getSubscriptionsAction}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        console.log("Subscriptions for user: ", data);

        setCategories(data);
      } catch (e) {
        Alert.alert(
          t("CategorySettings_ErrorLoading_AlertTitle"),
          t("CategorySettings_ErrorLoading")
        );
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchSubscriptions();
    }
  }, [visible, residentId, t]);

  // Handle the toggle action with optimistic update
  const handleToggle = useCallback(
    async (categoryHebName, newStatus) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.categoryHebName === categoryHebName
            ? { ...cat, isSubscribed: newStatus }
            : cat
        )
      );
      try {
        const apiUrl = `${Globals.API_BASE_URL}/api/${controllerName}/${updateSubscriptionAction}`;
        const response = await fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            residentId,
            categoryHebName,
            isSubscribed: newStatus,
          }),
        });
        if (!response.ok) throw new Error("Update failed on server");
      } catch (e) {
        Alert.alert(
          t("CategorySettings_ErrorUpdating_AlertTitle"),
          t("CategorySettings_ErrorUpdating")
        );
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
  title: {
    // Uses StyledText for global font scaling
  },
  subtitle: {
    fontSize: 18, // Slightly larger for readability
    textAlign: "center",
    color: "#6c6c70", // Softer color
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    // Position adapts to RTL/LTR via the parent's direction style
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
    paddingVertical: 18, // More vertical space for easier tapping
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryName: {
    fontSize: 20, // Larger font for category names
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
