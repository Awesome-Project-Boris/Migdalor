import React, { useState, useEffect, useRef, forwardRef  } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Keyboard } from 'react-native'; // 'Text' import removed
import FloatingLabelInput from './FloatingLabelInput';
import { useTranslation } from 'react-i18next';
import StyledText from "@/components/StyledText.jsx"; // Import StyledText

export default function MarketplaceSearchModal({ visible, onSearch, onCancel }) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState('');

  // Clear local state when modal is closed
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus(); 
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSearch = () => {
    // Dismiss keyboard if open
    Keyboard.dismiss();
    onSearch(localQuery);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Replaced Text with StyledText */}
          <StyledText style={styles.title}>{t("MarketplaceSearchItem_Header")}</StyledText>
          <FloatingLabelInput
            label= ''
            value={localQuery}
            onChangeText={setLocalQuery}
            style= {styles.input}
            autoFocus={true}
            onSubmitEditing={handleSearch}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSearch}>
              {/* Replaced Text with StyledText */}
              <StyledText style={styles.buttonText}>{t("MarketplaceSearchItem_SearchButton")}</StyledText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              {/* Replaced Text with StyledText */}
              <StyledText style={styles.buttonText}>{t("MarketplaceSearchItem_CancelButton")}</StyledText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#347af0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  input:
  {
    width: '100%',
 
  }
  
});