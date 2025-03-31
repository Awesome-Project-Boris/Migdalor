import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import FloatingLabelInput from './FloatingLabelInput';

export default function MarketplaceSearchModal({ visible, onSearch, onCancel }) {
  const [localQuery, setLocalQuery] = useState('');

  // Clear local state when modal is closed
  useEffect(() => {
    if (!visible) {
      setLocalQuery('');
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
          <Text style={styles.title}>חיפוש מוצר</Text>
          <FloatingLabelInput
            label= ''
            value={localQuery}
            onChangeText={setLocalQuery}
            style= {styles.input}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
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
