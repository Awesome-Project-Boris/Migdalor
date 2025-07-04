import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal, View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { fetchAllInterests } from '../services/interestService';
import { levenshteinDistance } from '../utils/stringSimilarity';
import InterestChip from './InterestChip'; // Your existing chip component

/**
 * A modal for selecting from a list of interests and adding new custom ones.
 *
 * @param {object} props
 * @param {boolean} props.visible - Controls if the modal is shown.
 * @param {'edit' | 'filter'} props.mode - 'edit' mode shows the "add new" section, 'filter' mode hides it.
 * @param {number[]} props.initialSelectedIds - Pre-selected interest IDs.
 * @param {function} props.onClose - Function to call to close the modal.
 * @param {function(object)} props.onConfirm - Callback with results.
 * - In 'edit' mode, returns { selectedIds: number[], newInterests: string[] }.
 * - In 'filter' mode, returns { selectedIds: number[] }.
 */
export default function InterestModal({
  visible,
  mode = 'filter',
  initialSelectedIds = [],
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();

  // State
  const [allInterests, setAllInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
  const [newlyAdded, setNewlyAdded] = useState([]);

  // Fetch all interests when modal opens
  useEffect(() => {
    if (visible) {
      fetchAllInterests().then(setAllInterests);
    }
  }, [visible]);

  // Reset state when modal re-opens
  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
    setSearchTerm('');
    setNewInterest('');
    setNewlyAdded([]);
  }, [visible, initialSelectedIds]);

  // Memoized filtered list of interests based on search term
  const filteredInterests = useMemo(() => {
    if (!searchTerm) return allInterests;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allInterests.filter(interest =>
      interest.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [allInterests, searchTerm]);

  // Update "Did you mean..." suggestions as user types
  useEffect(() => {
    if (newInterest.length < 3) {
      setSuggestions([]);
      return;
    }
    const lowercasedInput = newInterest.toLowerCase();
    const allSuggestions = allInterests
      .map(interest => ({
        ...interest,
        distance: levenshteinDistance(lowercasedInput, interest.name),
      }))
      .filter(interest => interest.distance < 4 && !selectedIds.has(interest.interestID))
      .sort((a, b) => a.distance - b.distance);

    setSuggestions(allSuggestions.slice(0, 3));
  }, [newInterest, allInterests, selectedIds]);

  // Handlers
  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);
  
  const handleSelectSuggestion = (id) => {
    handleSelect(id);
    setNewInterest('');
  };

  const handleAddNew = () => {
    if (newInterest.trim()) {
      setNewlyAdded(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
      Keyboard.dismiss();
    }
  };

  const handleConfirm = () => {
    const result = { selectedIds: Array.from(selectedIds) };
    if (mode === 'edit') {
      result.newInterests = newlyAdded;
    }
    onConfirm(result);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Floating Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('interestModal_title')}</Text>
          <TouchableOpacity onPress={handleConfirm} style={[styles.headerButton, styles.doneButton]}>
            <Text style={styles.doneButtonText}>{t('interestModal_doneButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('interestModal_searchPlaceholder')}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredInterests}
          keyExtractor={(item) => item.interestID.toString()}
          renderItem={({ item }) => (
            <InterestChip
              label={item.name}
              isSelected={selectedIds.has(item.interestID)}
              onPress={() => handleSelect(item.interestID)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          numColumns={2} // This creates a grid-like layout for the chips
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            mode === 'edit' ? (
              <View style={styles.addContainer}>
                <Text style={styles.addTitle}>{t('interestModal_addNewTitle')}</Text>
                {newlyAdded.map((item, index) => (
                  <InterestChip key={index} label={item} isSelected={true} onPress={()=>{}}/>
                ))}
                <TextInput
                  style={styles.addInput}
                  placeholder={t('interestModal_addPlaceholder')}
                  value={newInterest}
                  onChangeText={setNewInterest}
                  onSubmitEditing={handleAddNew}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                  <Text style={styles.addButtonText}>{t('interestModal_addButton')}</Text>
                </TouchableOpacity>

                {suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>{t('interestModal_suggestionsTitle')}</Text>
                    <View style={styles.suggestionsChips}>
                      {suggestions.map(sugg => (
                        <InterestChip
                          key={`sugg-${sugg.interestID}`}
                          label={sugg.name}
                          isSelected={false}
                          onPress={() => handleSelectSuggestion(sugg.interestID)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

// Add styles here
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerButton: { padding: 5 },
    doneButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    doneButtonText: { color: '#fff', fontWeight: 'bold' },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      margin: 15,
      paddingHorizontal: 10,
    },
    searchIcon: { marginRight: 5 },
    searchInput: { flex: 1, height: 40, fontSize: 16 },
    listContainer: { paddingHorizontal: 10, alignItems: 'center' },
    addContainer: {
      width: '100%',
      marginTop: 30,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      alignItems: 'center',
    },
    addTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    addInput: {
      width: '90%',
      height: 45,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 16,
      marginTop: 10,
    },
    addButton: {
      backgroundColor: '#28a745',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 15,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    suggestionsContainer: { marginTop: 20, width: '90%', alignItems: 'center' },
    suggestionsTitle: { color: '#666', marginBottom: 5 },
    suggestionsChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});