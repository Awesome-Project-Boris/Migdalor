import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import FlipButton from './FlipButton'; // Assuming FlipButton is in the same folder or adjust path
import { Ionicons } from '@expo/vector-icons'; // For Checkbox alternative


const SimpleCheckbox = ({ label, value, onValueChange }) => (
   <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)}>
      <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
   </TouchableOpacity>
);


// Props:
// - visible: boolean
// - onClose: function
// - allCategories: array of strings
// - initialSelectedCategories: array of strings (currently selected)
// - onApply: function(newSelectedCategories)

export default function FilterModal({ visible, onClose, allCategories, initialSelectedCategories, onApply }) {
   // Local state to manage selections within the modal before applying
   const [tempSelectedCategories, setTempSelectedCategories] = useState(initialSelectedCategories || []);

   // Update local state if initial selections change when modal re-opens
   useEffect(() => {
      setTempSelectedCategories(initialSelectedCategories || []);
   }, [initialSelectedCategories, visible]); // Re-sync when modal becomes visible or initial props change

   const handleToggleCategory = (category) => {
      setTempSelectedCategories(prev => {
         const newSelection = new Set(prev);
         if (newSelection.has(category)) {
           newSelection.delete(category);
         } else {
           newSelection.add(category);
         }
         return Array.from(newSelection); // Convert back to array for state/prop usage
      });
   };

   const handleSelectAll = () => {
       setTempSelectedCategories([...allCategories]); // Select all available categories
   };

   const handleDeselectAll = () => {
       setTempSelectedCategories([]); // Clear selection
   };

   const handleApply = () => {
       onApply(tempSelectedCategories); // Pass the confirmed selection back
   };

   const renderCategoryItem = ({ item: category }) => (
      <SimpleCheckbox
         label={category}
         value={tempSelectedCategories.includes(category)}
         onValueChange={() => handleToggleCategory(category)}
      />
   );

   return (
      <Modal
         animationType="slide" // Or 'fade'
         transparent={true}
         visible={visible}
         onRequestClose={onClose} // For Android back button
      >
         <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
               <Text style={styles.modalTitle}>סנן לפי קטגוריות</Text>

                <View style={styles.selectAllContainer}>
                    <TouchableOpacity onPress={handleSelectAll} style={styles.selectButton}>
                         <Text style={styles.selectButtonText}>בחר הכל</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeselectAll} style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>בטל את כל הבחירות</Text>
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
                  <FlipButton onPress={onClose} style={styles.actionButton} bgColor="#ccc">
                      <Text style={styles.actionButtonText}>ביטול</Text>
                  </FlipButton>
                  <FlipButton onPress={handleApply} style={styles.actionButton} bgColor="#007bff">
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>בצע סינון</Text>
                  </FlipButton>
               </View>
            </View>
         </View>
      </Modal>
   );
}

// --- Styles for Modal ---
const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
      justifyContent: 'center',
      alignItems: 'center',
   },
   modalContainer: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%', // Limit height
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
   },
   selectAllContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    selectButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    selectButtonText: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: '500',
    },
   list: {
      width: '100%',
      marginBottom: 20,
   },
   listContent: {
        paddingBottom: 10, // Ensure last item isn't cut off
    },
   checkboxContainer: { // Style for the category row
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      width: '100%',
   },
   checkboxBase: {
       width: 24,
       height: 24,
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 15,
       borderRadius: 4,
       borderWidth: 2,
       borderColor: '#007bff', // Use a clear color
       backgroundColor: 'transparent',
   },
   checkboxChecked: {
       backgroundColor: '#007bff', // Fill when checked
   },
   checkboxLabel: {
      fontSize: 18, // Larger text for readability
      flex: 1, // Allow text to wrap if needed
   },
   modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 10,
   },
   actionButton: {
      flex: 1, // Make buttons share space
      marginHorizontal: 10,
      paddingVertical: 12, // Adjust padding as needed
   },
   actionButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
   },
});