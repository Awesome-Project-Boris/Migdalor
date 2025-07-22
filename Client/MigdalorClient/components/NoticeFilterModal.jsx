import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import FlipButton from "./FlipButton";
import Checkbox from "./CheckBox";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";
import StyledText from "@/components/StyledText.jsx";
import { useSettings } from "@/context/SettingsContext.jsx";

const ItemSeparator = () => <View style={styles.itemSeparator} />;

export default function FilterModal({
  visible,
  onClose,
  allCategories,
  initialSelectedCategories,
  onApply,
}) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const isLargeFont = settings.fontSizeMultiplier === 3;

  const [tempSelectedCategories, setTempSelectedCategories] = useState(
    initialSelectedCategories || []
  );

  useEffect(() => {
    setTempSelectedCategories(initialSelectedCategories || []);
  }, [initialSelectedCategories, visible]);

  const handleToggleCategory = (category) => {
    setTempSelectedCategories((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(category)) {
        newSelection.delete(category);
      } else {
        newSelection.add(category);
      }
      return Array.from(newSelection);
    });
  };

  const handleSelectAll = () => {
    setTempSelectedCategories([...allCategories]);
  };

  const handleDeselectAll = () => {
    setTempSelectedCategories([]);
  };

  const handleApply = () => {
    onApply(tempSelectedCategories);
  };

  const renderCategoryItem = ({ item: category }) => (
    <View style={styles.checkboxItem}>
      <Checkbox
        text={category}
        isChecked={tempSelectedCategories.includes(category)}
        onPress={() => handleToggleCategory(category)}
        alignRight={Globals.userSelectedDirection === "rtl"}
        fillColor="#007bff"
        unFillColor="transparent"
      />
    </View>
  );

  const ListHeader = () => (
    <>
      <StyledText style={styles.modalTitle}>
        {t("NoticeFilterModal_modalTitle")}
      </StyledText>
      <View
        style={[
          styles.selectAllContainer,
          isLargeFont && styles.selectAllContainerVertical,
        ]}
      >
        <TouchableOpacity onPress={handleSelectAll} style={styles.selectButton}>
          <StyledText style={styles.selectButtonText}>
            {t("NoticeFilterModal_selectAll")}
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeselectAll}
          style={styles.selectButton}
        >
          <StyledText style={styles.selectButtonText}>
            {t("NoticeFilterModal_deselectAll")}
          </StyledText>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <FlatList
            ListHeaderComponent={ListHeader}
            data={allCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            style={styles.list}
            ItemSeparatorComponent={ItemSeparator}
          />

          <View
            style={[
              styles.modalActions,
              isLargeFont && styles.modalActionsVertical,
            ]}
          >
            <FlipButton
              onPress={onClose}
              style={[
                styles.actionButton,
                isLargeFont && styles.actionButtonVertical,
              ]}
              bgColor="#ccc"
            >
              <StyledText style={styles.actionButtonText}>
                {t("NoticeFilterModal_cancelButton")}
              </StyledText>
            </FlipButton>
            <FlipButton
              onPress={handleApply}
              style={[
                styles.actionButton,
                isLargeFont && styles.actionButtonVertical,
              ]}
              bgColor="#007bff"
            >
              <StyledText style={styles.actionButtonText}>
                {t("NoticeFilterModal_applyFilter")}
              </StyledText>
            </FlipButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
    flexDirection: "column",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectAllContainerVertical: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
    textAlign: "center",
  },
  list: {
    width: "100%",
  },
  checkboxItem: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems:
      Globals.userSelectedDirection === "rtl" ? "flex-end" : "flex-start",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  modalActionsVertical: {
    flexDirection: "column",
    gap: 12,
    paddingTop: 15,
    paddingBottom: 15,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  actionButtonVertical: {
    flex: 0,
    marginHorizontal: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
