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

  const searchableItems = useMemo(() => {
    if (!mapData || !mapData.buildings) return [];
    const allItems = [];
    mapData.buildings.forEach((structure) => {
      if (structure.buildingName) {
        allItems.push({
          type: "building",
          rawName: structure.buildingName,
          translatedName: t(structure.buildingName, {
            defaultValue: structure.buildingName,
          }),
          ...structure,
        });
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
      } else {
        if (structure.apartments) {
          structure.apartments.forEach((apt) => {
            allItems.push({
              type: "apartment",
              rawName: String(apt.displayNumber),
              translatedName: `${t("Common_Apartment")} ${apt.displayNumber}`,
              buildingTranslatedName: "",
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

  const isRTL = Globals.userSelectedDirection === "rtl";

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.resultItem,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
      onPress={() => handleSelectItem(item)}
    >
      <Ionicons
        name={item.type === "building" ? "business-outline" : "home-outline"}
        size={24}
        color="#555"
      />
      <View
        style={[
          styles.resultTextContainer,
          { [isRTL ? "marginRight" : "marginLeft"]: 15 },
        ]}
      >
        <Text
          style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}
        >
          {item.translatedName}
        </Text>
        {/* --- MODIFIED: Only render subtitle if it has content --- */}
        {item.type === "apartment" && item.buildingTranslatedName && (
          <Text
            style={[
              styles.resultSubtitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
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
          style={[styles.searchInput, { textAlign: isRTL ? "right" : "left" }]}
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
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultTextContainer: {
    flex: 1,
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
