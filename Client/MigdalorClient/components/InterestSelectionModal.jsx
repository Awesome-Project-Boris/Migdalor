import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Globals } from "../app/constants/Globals"; // For RTL support

// Import your custom components
import InterestChip from "./InterestChip";
import FloatingLabelInput from "./FloatingLabelInput";
import FlipButton from "./FlipButton";

export default function InterestModal({
  visible,
  mode = "edit",
  allInterests = [],
  initialSelectedNames = [],
  initialNewInterests = [], // Receives the preserved list
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const isRTL = Globals.userSelectedDirection === "rtl";

  const scrollViewRef = useRef(null);
  const newInterestInputRef = useRef(null);

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNames, setSelectedNames] = useState(new Set());
  const [newInterestInput, setNewInterestInput] = useState("");
  const [newlyAddedNames, setNewlyAddedNames] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Effect to reset the state when the modal becomes visible
  useEffect(() => {
    if (visible) {
      setSelectedNames(new Set(initialSelectedNames));
      setNewlyAddedNames(initialNewInterests || []);
      setSearchTerm("");
      setNewInterestInput("");
    }
    // This is a common technique to create a stable dependency from arrays.
    // The effect will now only re-run if the *content* of the arrays changes.
  }, [visible, JSON.stringify([initialSelectedNames, initialNewInterests])]);

  // keyboard focused

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    // Cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  //

  const handleNewInterestFocus = () => {
    setTimeout(() => {
      if (newInterestInputRef.current) {
        newInterestInputRef.current.measureLayout(
          scrollViewRef.current.getInnerViewNode(),
          (x, y) => {
            scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }
    }, 100);
  };

  // Memoized list of interests filtered by the search term
  const filteredInterests = useMemo(() => {
    if (!searchTerm) return allInterests;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allInterests.filter(
      (interest) =>
        !selectedNames.has(interest.name) && // Exclude already selected
        interest.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [allInterests, searchTerm, selectedNames]);

  // Handlers
  const handleSelect = (name) => {
    setSelectedNames((prev) => {
      const newSet = new Set(prev);
      newSet.has(name) ? newSet.delete(name) : newSet.add(name);
      return newSet;
    });
  };

  const handleAddNewInterest = () => {
    const newName = newInterestInput.trim();
    if (newName && !newlyAddedNames.includes(newName)) {
      setNewlyAddedNames((prev) => [...prev, newName]);
      setNewInterestInput("");
      Keyboard.dismiss();
    }
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

  // Replace your existing return statement with this corrected structure

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topPanel}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={32} color="#555" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* This block contains all content that will be hidden when the keyboard opens */}
          <View style={isKeyboardVisible ? styles.hidden : {}}>
            <Text style={styles.title}>{t("interestModal_title")}</Text>

            <FloatingLabelInput
              label={t("interestModal_searchPlaceholder")}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.inputContainer}
              alignRight={isRTL}
            />

            <Text style={styles.subHeader}>
              {t("interestModal_selectExisting")}
            </Text>
            <View style={styles.interestContainer}>
              {filteredInterests.length > 0 ? (
                filteredInterests.map((interest) => (
                  <InterestChip
                    key={interest.name}
                    label={interest.name} // Changed to pass the name string
                    isSelected={selectedNames.has(interest.name)}
                    onPress={() => handleSelect(interest.name)}
                  />
                ))
              ) : (
                <Text style={styles.noResultsText}>
                  {t("interestModal_noResults")}
                </Text>
              )}
            </View>
          </View>

          {mode === "edit" && (
            <>
              <Text style={styles.subHeader}>{t("interestModal_addNew")}</Text>
              <View style={styles.addContainer}>
                <FloatingLabelInput
                  ref={newInterestInputRef}
                  onFocus={handleNewInterestFocus}
                  label={t("interestModal_addPlaceholder")}
                  value={newInterestInput}
                  onChangeText={setNewInterestInput}
                  style={[styles.inputContainer, { marginBottom: 15 }]}
                  alignRight={isRTL}
                />
                <FlipButton
                  style={styles.addButton}
                  onPress={handleAddNewInterest}
                >
                  <Text style={styles.addButtonText}>
                    {t("interestModal_addButton")}
                  </Text>
                </FlipButton>
              </View>
            </>
          )}

          {/* This container for newly added chips is always visible */}
          {newlyAddedNames.length > 0 && (
            <View style={styles.newlyAddedContainer}>
              {newlyAddedNames.map((name) => (
                <InterestChip
                  key={name}
                  label={name}
                  isSelected={true}
                  onPress={() => handleRemoveNewInterest(name)}
                />
              ))}
            </View>
          )}

          {/* The footer is now inside the ScrollView and will be hidden with the keyboard */}
          <View style={[styles.footer, isKeyboardVisible ? styles.hidden : {}]}>
            <FlipButton onPress={handleConfirm} style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>
                {t("interestModal_acceptButton")}
              </Text>
            </FlipButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topPanel: {
    height: 60,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 15,
  },
  closeButton: { padding: 5 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for the floating footer
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginTop: 25,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 5,
    marginTop: 25,
  },
  interestContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f0f2f5", // Dim gray color
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0", // Mild border
    padding: 10,
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
    alignItems: "center",
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 8,
    marginBottom: 40,
  },
  addButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  newlyAddedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: 40,
  },
  footer: {
    paddingTop: 20, // Extra space for home bar on iOS
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  acceptButton: {
    minHeight: 65,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  // Add this new style to your existing StyleSheet.create({...}) call
  focusedAddContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  hidden: {
    display: "none",
  },
});
