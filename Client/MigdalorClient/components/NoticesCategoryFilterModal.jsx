// components/NoticesCategoryFilterModal.jsx

import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import StyledText from "./StyledText";
import { Ionicons } from "@expo/vector-icons";
import FlipButton from "./FlipButton";
import { useSettings } from "@/context/SettingsContext";

export default function NoticesCategoryFilterModal({
  visible,
  onClose,
  subscribedCategories,
  selectedCategories,
  onSelectionChange,
  allCategories,
}) {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const useColumnLayout = settings.fontSizeMultiplier >= 2;

  const handleToggle = (categoryName) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryName)) {
      newSelection.delete(categoryName);
    } else {
      newSelection.add(categoryName);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(
      new Set(subscribedCategories.map((c) => c.categoryHebName))
    );
  };

  const CategorySelectItem = ({ category, isSelected, onToggle }) => {
    // Find the full category object from the allCategories prop
    const fullCategory = allCategories.find(
      (c) => c.categoryHebName === category.categoryHebName
    );

    // Determine the name to display
    const displayName = fullCategory
      ? i18n.language === "en"
        ? fullCategory.categoryEngName
        : fullCategory.categoryHebName
      : category.categoryHebName; // Fallback to the Hebrew name

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={onToggle}>
        <StyledText style={styles.categoryName}>{displayName}</StyledText>
        <Ionicons
          name={isSelected ? "checkbox" : "square-outline"}
          size={30}
          color={isSelected ? "#007AFF" : "#8e8e93"}
        />
      </TouchableOpacity>
    );
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ScrollView style={styles.listContainer}>
          <StyledText style={styles.title}>
            {t("NoticeFilterModal_modalTitle")}
          </StyledText>
          <StyledText style={styles.subtitle}>
            {t("NoticeFilterModal_modalSubtitle")}
          </StyledText>
          <View
            style={[
              styles.toggleAllContainer,
              useColumnLayout && styles.toggleAllContainerColumn,
            ]}
          >
            <FlipButton onPress={handleSelectAll} style={{ flex: 1 }}>
              {t("NoticeFilterModal_selectAll")}
            </FlipButton>
            <FlipButton
              onPress={handleDeselectAll}
              style={{ flex: 1 }}
              bgColor="#6c6c70"
            >
              {t("NoticeFilterModal_deselectAll")}
            </FlipButton>
          </View>
          {subscribedCategories.map((cat) => (
            <CategorySelectItem
              key={cat.categoryHebName}
              category={cat}
              isSelected={selectedCategories.has(cat.categoryHebName)}
              onToggle={() => handleToggle(cat.categoryHebName)}
            />
          ))}
        </ScrollView>
        <FlipButton onPress={onClose} style={styles.applyButton}>
          {t("Common_Done")}
        </FlipButton>
      </View>
    </View>
  );
}

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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c6c70",
    textAlign: "center",
    marginBottom: 20,
  },
  toggleAllContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  toggleAllContainerColumn: {
    flexDirection: "column",
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
