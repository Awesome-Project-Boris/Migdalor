import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import FlipButtonSizeless from "@/components/FlipButtonSizeless";
import { Ionicons } from "@expo/vector-icons";
import { Globals } from "@/app/constants/Globals";

const NavigationModal = ({ visible, mapData, onClose, onStartNavigation }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  // useMemo will re-calculate the search results only when the search term or map data changes.
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();

    // Filter buildings by name
    const buildings = mapData.buildings
      .filter((b) => b.buildingName?.toLowerCase().includes(lowerCaseSearch))
      .map((b) => ({ type: "building", ...b }));

    // Filter apartments by number
    const apartments = mapData.buildings.flatMap((b) =>
      b.apartments
        .filter((a) => String(a.displayNumber).includes(lowerCaseSearch))
        .map((a) => ({
          type: "apartment",
          ...a,
          // Add building info to the apartment object for context
          buildingName: b.buildingName,
          physicalBuildingID: b.buildingID,
          entranceNodeIds: b.entranceNodeIds,
        }))
    );

    // We can add services search here in the future
    // const services = ...

    return [...buildings, ...apartments];
  }, [searchTerm, mapData]);

  const handleSelectItem = (item) => {
    setSearchTerm(""); // Clear search term after selection
    onStartNavigation(item);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectItem(item)}
    >
      <Ionicons
        name={item.type === "building" ? "business-outline" : "home-outline"}
        size={24}
        color="#555"
      />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle}>
          {item.type === "building"
            ? t(item.buildingName, { defaultValue: item.buildingName })
            : `${t("Apartment", "Apartment")} ${item.displayNumber}`}
        </Text>
        {item.type === "apartment" && (
          <Text style={styles.resultSubtitle}>
            {t(item.buildingName, { defaultValue: item.buildingName })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {t("Navigation_Title", "Navigate To")}
          </Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder={t(
            "Navigation_SearchPlaceholder",
            "Search apartment or building..."
          )}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#888"
        />
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type + (item.buildingID || item.apartmentNumber) + index
          }
          style={styles.list}
        />
        <FlipButtonSizeless
          onPress={() => {
            setSearchTerm("");
            onClose();
          }}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>{t("Cancel")}</Text>
        </FlipButtonSizeless>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fef1e6",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    margin: 20,
    fontSize: 18,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultTextContainer: {
    marginLeft: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    padding: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default NavigationModal;
