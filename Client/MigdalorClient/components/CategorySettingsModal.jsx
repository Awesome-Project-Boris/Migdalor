import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";
import { Ionicons } from "@expo/vector-icons";

import { Globals } from "@/app/constants/Globals";
import StyledText from "./StyledText";
import FlipButton from "./FlipButton";

// A simpler, column-based layout for each category item.
const CategoryItem = ({ item, onToggle, isRTL }) => {
  const isSelected = item.isSubscribed;

  const displayName =
    !isRTL && item.categoryEngName
      ? item.categoryEngName
      : item.categoryHebName;

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onToggle(item.categoryHebName, !isSelected)}
    >
      <StyledText style={styles.categoryName} isRTL={isRTL}>
        {displayName}
      </StyledText>
      <Ionicons
        name={isSelected ? "checkbox" : "square-outline"}
        size={30}
        color={isSelected ? "#007AFF" : "#8e8e93"}
      />
    </TouchableOpacity>
  );
};

const CategorySettingsModal = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [residentId, setResidentId] = useState(null);

  const isRTL = i18n.dir() === "rtl";
  const controllerName = "Resident";
  const updateSubscriptionAction = "subscriptions";

  useEffect(() => {
    const loadResidentId = async () => {
      const userIdFromStorage = visible
        ? await AsyncStorage.getItem("userID")
        : null;
      setResidentId(userIdFromStorage);
    };
    loadResidentId();
  }, [visible]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!residentId) return;
      setLoading(true);
      try {
        const allCategoriesUrl = `${Globals.API_BASE_URL}/api/Categories`;
        const userSubscriptionsUrl = `${Globals.API_BASE_URL}/api/${controllerName}/subscriptions/${residentId}`;

        const [allCategoriesResponse, userSubscriptionsResponse] =
          await Promise.all([
            fetch(allCategoriesUrl),
            fetch(userSubscriptionsUrl),
          ]);

        if (!allCategoriesResponse.ok || !userSubscriptionsResponse.ok) {
          throw new Error("Server error fetching category data.");
        }

        const allCategories = await allCategoriesResponse.json();
        const userSubscriptions = await userSubscriptionsResponse.json();
        const subscriptionMap = new Map(
          userSubscriptions.map((sub) => [
            sub.categoryHebName,
            sub.isSubscribed,
          ])
        );

        const mergedCategories = allCategories.map((category) => ({
          ...category,
          isSubscribed: subscriptionMap.get(category.categoryHebName) || false,
        }));
        setCategories(mergedCategories);
      } catch (e) {
        console.error("Error fetching category data:", e);
        Alert.alert(
          t("CategorySettings_ErrorLoading_AlertTitle"),
          t("CategorySettings_ErrorLoading")
        );
      } finally {
        setLoading(false);
      }
    };
    if (visible) {
      fetchCategoryData();
    }
  }, [visible, residentId, t]);

  const handleToggle = useCallback(
    async (categoryHebName, newStatus) => {
      if (!residentId) return;
      // Optimistic UI update
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
          text1: t("CategorySettings_UpdateSuccess"),
        });
      } catch (e) {
        // Revert on failure
        Toast.show({
          type: "error",
          text1: t("CategorySettings_ErrorUpdating_AlertTitle"),
          text2: t("CategorySettings_ErrorUpdating"),
        });
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
      <ScrollView style={styles.listContainer}>
        <StyledText style={styles.title} isRTL={isRTL}>
          {t("CategorySettings_Title")}
        </StyledText>
        <StyledText style={styles.subtitle} isRTL={isRTL}>
          {t("CategorySettings_Subtitle")}
        </StyledText>
        {categories.map((item) => (
          <CategoryItem
            key={item.categoryHebName}
            item={item}
            onToggle={handleToggle}
            isRTL={isRTL}
          />
        ))}
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { direction: isRTL ? "rtl" : "ltr" }]}>
        {renderContent()}
        <FlipButton onPress={onClose} style={styles.applyButton}>
          {t("Common_Done")}
        </FlipButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    height: "80%",
    backgroundColor: "#f2f2f7",
    borderRadius: 20,
    padding: 20,
    flexDirection: "column",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c6c70",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  categoryName: {
    fontSize: 20,
    marginBottom: 10,
  },
  applyButton: {
    marginTop: 20,
  },
});

export default CategorySettingsModal;
