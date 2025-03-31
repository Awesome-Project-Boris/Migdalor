import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Dimensions, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FlipButton from './FlipButton';
import LabeledTextInput from './LabeledTextInput';

console.log("Imported ImagePicker Object:", JSON.stringify(ImagePicker, null, 2)); // <-- ADD THIS LINE

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function AddNewItemModal({ visible, onClose, onSubmit }) {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const ITEM_NAME_LIMIT = 50;
  const DESCRIPTION_LIMIT = 200;

  const hasUnsavedChanges = () =>
    itemName.trim() !== '' ||
    itemDescription.trim() !== '' ||
    mainImage !== null ||
    extraImage !== null;

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowConfirm(false);
    resetState(); 
    onClose();
  };

  const resetState = () => {
    setItemName('');
    setItemDescription('');
    setMainImage(null);
    setExtraImage(null);
  };


  const handleSubmit = () => {
    console.log('Submitting new item:', { itemName, itemDescription, mainImage, extraImage });
    // Clear inputs if needed
    resetState(''); // MAYBE NEEDS TO HAPPEN LATER?
    if (onSubmit) {
      onSubmit({ itemName, itemDescription, mainImage, extraImage });
    }
    onClose();
  };

  const pickImage = async (setImage) => {
    // Request permissions first (optional but recommended)
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Media Library Permission Status:', libraryPermission.status); // Add this log
    if (libraryPermission.status !== 'granted') {
        Alert.alert('Permission needed', 'Permission to access media library is required!');
        return;
    }   
  
    if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
      Alert.alert('Permissions needed', 'Camera and Media Library permissions are required!');
      return;
    }
  
    // Show options to the user
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true, // Optional
              quality: 1,
              // mediaTypes is not needed here as launchCameraAsync defaults to images
            });
            if (!result.canceled && result.assets) { // Check for assets
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Choose From Library",
          onPress: async () => {
            console.log("Attempting to launch image library..."); // Log start
            try {
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: [ImagePicker.MediaType.Images],
                // allowsEditing: true, // You can temporarily remove this for testing
                // quality: 1,       // You can temporarily remove this for testing
              });
              console.log("Image Library Result:", JSON.stringify(result, null, 2)); // Log the full result object
          
              if (result.canceled) {
                console.log("User cancelled image picker.");
              } else if (result.assets && result.assets.length > 0) {
                console.log("Image selected:", result.assets[0].uri);
                setImage(result.assets[0].uri);
              } else {
                console.log("Picker finished but no assets found or result structure unexpected.");
              }
            } catch (error) {
              console.error("Error launching image library:", error); // Log any errors
              Alert.alert("Error", "Could not open image library.");
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <ScrollView style={styles.overlay} contentContainerStyle={styles.overlayContent}>
        <View style={styles.modalContainer}>

          <View style={styles.headerRow}>
            <FlipButton onPress={handleCancel} bgColor="white" textColor="black" style={styles.returnButton}>
              <Text style={styles.buttonLabel}>חזרה</Text>
            </FlipButton>
            <Text style={styles.modalTitle}>New item listing</Text>
          </View>

          <LabeledTextInput
            label={`Item Name (max ${ITEM_NAME_LIMIT} characters)`}
            value={itemName}
            onChangeText={(text) => text.length <= ITEM_NAME_LIMIT && setItemName(text)}
            placeholder="Enter item name"
          />
          <Text style={styles.charCount}>{itemName.length}/{ITEM_NAME_LIMIT}</Text>
          <LabeledTextInput
            label={`Description (max ${DESCRIPTION_LIMIT} characters)`}
            value={itemDescription}
            onChangeText={(text) => text.length <= DESCRIPTION_LIMIT && setItemDescription(text)}
            placeholder="Enter description"
            multiline={true}
            containerStyle={styles.multilineContainer}
          />
          <Text style={styles.charCount}>{itemDescription.length}/{DESCRIPTION_LIMIT}</Text>

          <View style={styles.imageRow}>
            <FlipButton onPress={() => pickImage(setMainImage)} bgColor="white" textColor="black" style={styles.imageButton}>
              <Text style={styles.buttonLabel}>Pick Main Image</Text>
            </FlipButton>
            {mainImage && <Image source={{ uri: mainImage }} style={styles.selectedImage} />}
          </View>
          <View style={styles.imageRow}>
            <FlipButton onPress={() => pickImage(setExtraImage)} bgColor="white" textColor="black" style={styles.imageButton}>
              <Text style={styles.buttonLabel}>Pick Extra Image</Text>
            </FlipButton>
            {extraImage && <Image source={{ uri: extraImage }} style={styles.selectedImage} />}
          </View>
          {/* Bottom Buttons */}
          <View style={styles.buttonRow}>
            <FlipButton onPress={handleSubmit} bgColor="white" textColor="black" style={styles.submitButton}>
              <Text style={styles.buttonLabel}>Submit</Text>
            </FlipButton>
            <FlipButton onPress={handleCancel} bgColor="white" textColor="black" style={styles.cancelButton}>
              <Text style={styles.buttonLabel}>Cancel</Text>
            </FlipButton>
          </View>
        </View>
      </ScrollView>
      {showConfirm && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>You have unsaved changes. Are you sure you want to leave?</Text>
              <View style={styles.confirmButtonRow}>
                <FlipButton onPress={confirmCancel} bgColor="white" textColor="black" style={styles.confirmButton}>
                  <Text style={styles.buttonLabel}>Yes</Text>
                </FlipButton>
                <FlipButton onPress={() => setShowConfirm(false)} bgColor="white" textColor="black" style={styles.confirmButton}>
                  <Text style={styles.buttonLabel}>No</Text>
                </FlipButton>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.75,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  returnButton: {
    marginRight: 16,
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    fontSize: 14,
    color: 'gray',
  },
  multilineContainer: {
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  imageButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    // Add flexWrap or adjust widths if overflow occurs
    // flexWrap: 'wrap',
  },
  imageButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    // Adjust width if necessary, e.g., width: '70%'
    alignItems: 'center',
  },
  selectedImage: {
    width: 60, // Adjusted size
    height: 60, // Adjusted size
    borderRadius: 8,
  },
});

export default AddNewItemModal;
