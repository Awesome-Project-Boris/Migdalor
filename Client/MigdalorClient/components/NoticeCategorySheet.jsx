import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import StyledText from "./StyledText";
import { Ionicons } from "@expo/vector-icons";
import FlipButton from "./FlipButton";

// A single selectable item in the sheet
const CategorySelectItem = ({ category, isSelected, onToggle }) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onToggle}>
      <StyledText style={styles.categoryName}>
        {category.categoryHebName}
      </StyledText>
      <Ionicons
        name={isSelected ? "checkbox" : "square-outline"}
        size={30}
        color={isSelected ? "#007AFF" : "#8e8e93"}
      />
    </TouchableOpacity>
  );
};

const NoticeCategorySheet = React.forwardRef(
  (
    { subscribedCategories, selectedCategories, onSelectionChange, onApply },
    ref
  ) => {
    const { t } = useTranslation();
    const snapPoints = React.useMemo(() => ["50%", "85%"], []);

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
      const allCategoryNames = new Set(
        subscribedCategories.map((c) => c.categoryHebName)
      );
      onSelectionChange(allCategoryNames);
    };

    const handleDeselectAll = () => {
      onSelectionChange(new Set());
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Hidden by default
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.sheetContent}>
          <StyledText type="title" style={styles.sheetTitle}>
            {t("Notices_FilterTitle", "סינון לפי קטגוריה")}
          </StyledText>
          <View style={styles.toggleAllContainer}>
            <FlipButton onPress={handleSelectAll} style={{ flex: 1 }}>
              {t("Notices_SelectAll", "בחר הכל")}
            </FlipButton>
            <FlipButton
              onPress={handleDeselectAll}
              style={{ flex: 1 }}
              bgColor="#6c6c70"
            >
              {t("Notices_DeselectAll", "נקה הכל")}
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
          <FlipButton onPress={onApply} style={styles.applyButton}>
            {t("Notices_ApplyFilters", "הצג תוצאות")}
          </FlipButton>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: "#f2f2f7" },
  sheetContent: { flex: 1, padding: 20 },
  sheetTitle: { textAlign: "center", marginBottom: 20 },
  toggleAllContainer: { flexDirection: "row", gap: 15, marginBottom: 15 },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#e5e5ea",
  },
  categoryName: { fontSize: 20 },
  applyButton: { marginTop: 30 },
});

export default NoticeCategorySheet;
