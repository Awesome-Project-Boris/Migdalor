import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import FlipButton from "./FlipButton";
import Checkbox from "./CheckBox";
import { useTranslation } from "react-i18next";
import { Globals } from "@/app/constants/Globals";

export default function FilterModal({
  visible,
  onClose,
  allCategories,
  initialSelectedCategories,
  onApply,
}) {
  const { t } = useTranslation();

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
    <Checkbox
      text={category}
      isChecked={tempSelectedCategories.includes(category)}
      onPress={() => handleToggleCategory(category)}
      alignRight={Globals.userSelectedDirection === "rtl"}
      fillColor="#007bff"
      unFillColor="transparent"
    />
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
          <Text style={styles.modalTitle}>
            {t("NoticeFilterModal_modalTitle")}
          </Text>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity
              onPress={handleSelectAll}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {t("NoticeFilterModal_selectAll")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeselectAll}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {t("NoticeFilterModal_deselectAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={allCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.modalActions}>
            <FlipButton
              onPress={onClose}
              style={styles.actionButton}
              bgColor="#ccc"
            >
              <Text style={styles.actionButtonText}>
                {t("NoticeFilterModal_cancelButton")}
              </Text>
            </FlipButton>
            <FlipButton
              onPress={handleApply}
              style={styles.actionButton}
              bgColor="#007bff"
            >
              <Text style={styles.actionButtonText}>
                {t("NoticeFilterModal_applyFilter")}
              </Text>
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
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
  },
  list: {
    width: "100%",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
