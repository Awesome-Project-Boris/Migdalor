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
import { useTranslation } from "react-i18next"; // FOR TESTING PURPOSES
import FlipButtonSizeless from "@/components/FlipButtonSizeless";
import { Ionicons } from "@expo/vector-icons";
import { Globals } from "@/app/constants/Globals";

const NavigationModal = ({ visible, mapData, onClose, onStartNavigation }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  // Step 1: Prepare a clean, searchable list with translated names one time.

  const searchableItems = useMemo(() => {
    // Return early if there's no data to process
    if (!mapData || !mapData.buildings) return [];

    const allItems = [];

    // Loop through each structure from the API
    mapData.buildings.forEach((structure) => {
      // Case 1: The structure is a major, named building
      if (structure.buildingName) {
        // Add the building itself as a searchable item
        allItems.push({
          type: "building",
          rawName: structure.buildingName,
          translatedName: t(structure.buildingName, {
            defaultValue: structure.buildingName,
          }),
          ...structure,
        });

        // Add all apartments nested under this building, with a reference to the parent
        if (structure.apartments) {
          structure.apartments.forEach((apt) => {
            allItems.push({
              type: "apartment",
              rawName: String(apt.displayNumber),
              translatedName: `${t("Common_Apartment")} ${apt.displayNumber}`,
              buildingTranslatedName: t(structure.buildingName, {
                defaultValue: structure.buildingName,
              }),
              ...apt,
              physicalBuildingID: structure.buildingID,
              entranceNodeIds: structure.entranceNodeIds,
            });
          });
        }
      }
      // Case 2: The structure is a small, unnamed residence (duplex, etc.)
      else {
        // For these, add only the apartments as top-level searchable items
        if (structure.apartments) {
          structure.apartments.forEach((apt) => {
            allItems.push({
              type: "apartment",
              rawName: String(apt.displayNumber),
              translatedName: `${t("Common_Apartment")} ${apt.displayNumber}`,
              buildingTranslatedName: "", // Intentionally blank as there's no parent building name
              ...apt,
              physicalBuildingID: structure.buildingID,
              entranceNodeIds: structure.entranceNodeIds,
            });
          });
        }
      }
    });

    return allItems;
  }, [mapData, t]);

  // Step 2: Filter the pre-prepared list without calling t() again.
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();

    return searchableItems.filter((item) => {
      const rawMatch = item.rawName.toLowerCase().includes(lowerCaseSearch);
      const translatedMatch = item.translatedName
        .toLowerCase()
        .includes(lowerCaseSearch);
      return rawMatch || translatedMatch;
    });
  }, [searchTerm, searchableItems]);

  const handleSelectItem = (item) => {
    setSearchTerm("");
    onStartNavigation(item);
  };

  // Step 3: Render the item using the pre-translated name.
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
        <Text style={styles.resultTitle}>{item.translatedName}</Text>
        {item.type === "apartment" && (
          <Text style={styles.resultSubtitle}>
            {item.buildingTranslatedName}
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
          <Text style={styles.modalTitle}>{t("Navigation_Title")}</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder={t("Navigation_SearchPlaceholder")}
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
