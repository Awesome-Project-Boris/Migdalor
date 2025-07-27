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

  // ✅ If not visible, render nothing.
  if (!visible) {
    return null;
  }

  // ✅ When visible, render our custom overlay View instead of a Modal.
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <StyledText style={styles.title}>
          {t("NoticeFilterModal_modalTitle")}
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
        <ScrollView style={styles.listContainer}>
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
  // ✅ This style makes the View cover the whole screen like a modal backdrop
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
  // ✅ This is the white "card" that holds the content
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
    flex: 1, // This will now work correctly within the fixed-size container
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  categoryName: {
    fontSize: 20,
  },
  applyButton: {
    marginTop: 20,
  },
});
