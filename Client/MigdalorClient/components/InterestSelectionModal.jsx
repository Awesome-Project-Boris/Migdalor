import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Toast } from "toastify-react-native";

// Custom components and hooks
import InterestChip from "./InterestChip";
import FloatingLabelInput from "./FloatingLabelInput";
import FlipButton from "./FlipButton";
import StyledText from "@/components/StyledText";
import { useSettings } from "@/context/SettingsContext";

import { hebrewLevenshtein } from "../utils/stringSimilarityHeb";

export default function InterestModal({
  visible,
  mode = "edit",
  allInterests = [],
  initialSelectedNames = [],
  initialNewInterests = [],
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const isRTL = settings.language === "he";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      backgroundColor: "#fff",
    },
    headerColumn: {
      flexDirection: "column",
      alignItems: "stretch",
      paddingBottom: 15,
      borderBottomWidth: 0,
      marginTop: 15,
    },
    headerButton: {
      padding: 5,
      alignSelf: "flex-start",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#111",
      flexShrink: 1,
      paddingHorizontal: 10,
    },
    titleColumn: {
      textAlign: "center",
      marginVertical: 15,
      fontSize: 22,
    },
    acceptButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    acceptButtonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "bold",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    subHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: "#444",
      marginTop: 25,
      marginBottom: 15,
      textAlign: isRTL ? "right" : "left",
    },
    disclaimerText: {
      fontSize: 14,
      color: "#6c757d",
      marginBottom: 15,
      marginTop: -10, // Pull it closer to the sub-header above it
      fontStyle: "italic",
      textAlign: isRTL ? "right" : "left",
    },
    inputContainer: {
      marginBottom: 5,
    },
    interestContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      backgroundColor: "#fff",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#e0e0e0",
      padding: 5,
      minHeight: 100,
      justifyContent: "flex-start",
    },
    noResultsText: {
      flex: 1,
      textAlign: "center",
      color: "#888",
      marginTop: 30,
      fontSize: 16,
    },
    addContainer: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: 15,
    },
    addButton: {
      paddingVertical: 16,
      paddingHorizontal: 25,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "bold",
    },
    suggestionContainer: {
      position: "absolute",
      top: 80,
      left: 20,
      right: 20,
      zIndex: 10,
    },
    suggestionBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 12,
      paddingRight: 40,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    suggestionBoxColumn: {
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: 15,
    },
    suggestionText: {
      fontSize: 16,
      color: "#333",
      fontWeight: "600",
      marginRight: 10,
      marginBottom: 5,
    },
    suggestionClose: {
      position: "absolute",
      top: 5,
      right: 5,
      padding: 5,
    },
  });

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNames, setSelectedNames] = useState(new Set());
  const [newInterestInput, setNewInterestInput] = useState("");
  const [newlyAddedNames, setNewlyAddedNames] = useState([]);
  const [suggestedInterest, setSuggestedInterest] = useState(null);

  const useColumnLayout = settings.fontSizeMultiplier >= 2.0;

  useEffect(() => {
    if (visible) {
      setSelectedNames(new Set(initialSelectedNames));
      setNewlyAddedNames(initialNewInterests || []);
      setSearchTerm("");
      setNewInterestInput("");
      setSuggestedInterest(null);
    }
  }, [
    visible,
    JSON.stringify(initialSelectedNames),
    JSON.stringify(initialNewInterests),
  ]);

  useEffect(() => {
    if (!newInterestInput || newInterestInput.length < 2) {
      setSuggestedInterest(null);
      return;
    }

    let bestMatch = null;
    let minDistance = 1.5;

    for (const interest of allInterests) {
      const wordsInInterest = interest.name.split(" ");
      for (const word of wordsInInterest) {
        const distance = hebrewLevenshtein(newInterestInput, word);
        if (distance < minDistance && !selectedNames.has(interest.name)) {
          minDistance = distance;
          bestMatch = interest.name;
        }
      }
    }
    setSuggestedInterest(bestMatch);
  }, [newInterestInput, allInterests, selectedNames]);

  const filteredInterests = useMemo(() => {
    if (!searchTerm) return allInterests;
    return allInterests.filter((interest) =>
      interest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allInterests, searchTerm]);

  const hebrewRegex = /^[\u0590-\u05FF\s]*$/;
  const handleSearchChange = (text) => {
    if (hebrewRegex.test(text)) setSearchTerm(text);
  };
  const handleNewInterestChange = (text) => {
    if (hebrewRegex.test(text)) setNewInterestInput(text);
  };

  const handleSelect = (name) => {
    setSelectedNames((prev) => {
      const newSet = new Set(prev);
      newSet.has(name) ? newSet.delete(name) : newSet.add(name);
      return newSet;
    });
  };

  const handleAddNewInterest = () => {
    const newName = newInterestInput.trim();
    if (!newName) return;
    const allExistingNames = [
      ...allInterests.map((i) => i.name),
      ...newlyAddedNames,
    ];

    if (
      allExistingNames.some(
        (name) => name.toLowerCase() === newName.toLowerCase()
      )
    ) {
      Toast.show({
        type: "info",
        text1: t("interestModal_existsTitle"),
        text2: t("interestModal_existsMsg"),
      });
      const originalName = allExistingNames.find(
        (name) => name.toLowerCase() === newName.toLowerCase()
      );
      if (originalName && !selectedNames.has(originalName)) {
        handleSelect(originalName);
      }
      setNewInterestInput("");
      setSuggestedInterest(null);
      Keyboard.dismiss();
      return;
    }

    for (const existingName of allExistingNames) {
      const distance = hebrewLevenshtein(newName, existingName);
      if (distance < 1.5) {
        Alert.alert(
          t("interestModal_similarTitle"),
          t("interestModal_similarMsg", { newName, existingName }),
          [
            { text: t("Common_Cancel"), style: "cancel" },
            {
              text: t("interestModal_addAnyway"),
              onPress: () => addInterestConfirmed(newName),
            },
          ]
        );
        return;
      }
    }
    addInterestConfirmed(newName);
  };

  const addInterestConfirmed = (name) => {
    setNewlyAddedNames((prev) => [...prev, name]);
    setNewInterestInput("");
    setSuggestedInterest(null);
    Keyboard.dismiss();
  };

  const handleRemoveNewInterest = (nameToRemove) => {
    setNewlyAddedNames((prev) => prev.filter((name) => name !== nameToRemove));
  };

  const handleConfirm = () => {
    onConfirm({
      selectedNames: Array.from(selectedNames),
      newInterests: newlyAddedNames,
    });
    onClose();
  };

  const selectedAndAdded = useMemo(() => {
    const combined = new Set([...selectedNames, ...newlyAddedNames]);
    return Array.from(combined);
  }, [selectedNames, newlyAddedNames]);

  const headerContent = (
    <View style={[styles.header, useColumnLayout && styles.headerColumn]}>
      <TouchableOpacity onPress={onClose} style={styles.headerButton}>
        <Ionicons name="close" size={32} color="#555" />
      </TouchableOpacity>
      <StyledText style={[styles.title, useColumnLayout && styles.titleColumn]}>
        {t("interestModal_title")}
      </StyledText>
      <FlipButton
        onPress={handleConfirm}
        style={[styles.acceptButton, useColumnLayout && { width: '100%' }]}
      >
        <StyledText style={styles.acceptButtonText}>
          {t("interestModal_acceptButton")}
        </StyledText>
      </FlipButton>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {!useColumnLayout && headerContent}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {useColumnLayout && headerContent}

          {selectedAndAdded.length > 0 && (
            <>
              <StyledText style={styles.subHeader}>
                {t("interestModal_yourSelections")}
              </StyledText>
              <StyledText style={styles.disclaimerText}>
                {t("interestModal_deselectDisclaimer")}
              </StyledText>
              <View style={styles.interestContainer}>
                {selectedAndAdded.map((name) => (
                  <InterestChip
                    key={name}
                    label={name}
                    isSelected={true}
                    showDeleteIcon={newlyAddedNames.includes(name)}
                    onPress={() => {
                      if (newlyAddedNames.includes(name)) {
                        handleRemoveNewInterest(name);
                      } else {
                        handleSelect(name);
                      }
                    }}
                  />
                ))}
              </View>
            </>
          )}

          <StyledText style={styles.subHeader}>
            {t("interestModal_selectExisting")}
          </StyledText>

          <FloatingLabelInput
            label={t("interestModal_searchPlaceholder")}
            value={searchTerm}
            onChangeText={handleSearchChange}
            style={styles.inputContainer}
            alignRight={isRTL}
            size={25}
          />
          <View
            style={[styles.interestContainer, { backgroundColor: "#f0f2f5" }]}
          >
            {filteredInterests.length > 0 ? (
              filteredInterests
                .filter((i) => !selectedNames.has(i.name))
                .map((interest) => (
                  <InterestChip
                    key={interest.name}
                    label={interest.name}
                    isSelected={false}
                    onPress={() => handleSelect(interest.name)}
                  />
                ))
            ) : (
              <StyledText style={styles.noResultsText}>
                {t("interestModal_noResults")}
              </StyledText>
            )}
          </View>

          {mode === "edit" && (
            <>
              <StyledText style={styles.subHeader}>
                {t("interestModal_addNew")}
              </StyledText>
              <View style={styles.addContainer}>
                  <FloatingLabelInput
                    label={t("interestModal_addPlaceholder")}
                    value={newInterestInput}
                    onChangeText={handleNewInterestChange}
                    alignRight={isRTL}
                    size={25}
                  />
                  <FlipButton
                    style={styles.addButton}
                    onPress={handleAddNewInterest}
                  >
                    <StyledText style={styles.addButtonText}>
                      {t("interestModal_addButton")}
                    </StyledText>
                  </FlipButton>
              </View>
            </>
          )}
        </ScrollView>

        {suggestedInterest && (
          <View style={styles.suggestionContainer}>
            <View
              style={[
                styles.suggestionBox,
                useColumnLayout && styles.suggestionBoxColumn,
              ]}
            >
              <StyledText style={styles.suggestionText}>
                {t("interestModal_didYouMean")}
              </StyledText>
              <InterestChip
                label={suggestedInterest}
                onPress={() => {
                  handleSelect(suggestedInterest);
                  setNewInterestInput("");
                  setSuggestedInterest(null);
                  Keyboard.dismiss();
                  Toast.show({
                    type: "success",
                    text1: t("interestModal_suggestionAcceptedTitle"),
                    text2: t("interestModal_suggestionAcceptedMsg"),
                  });
                }}
              />
              <TouchableOpacity
                style={styles.suggestionClose}
                onPress={() => setSuggestedInterest(null)}
              >
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
