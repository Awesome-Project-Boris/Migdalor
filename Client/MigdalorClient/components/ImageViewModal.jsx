// frontend/components/ImageViewModal.jsx

import React from 'react';
import { Modal, Image as RNImage, StyleSheet, Dimensions, Text, View // Use RN View for positioning if needed
} from 'react-native';
import FlipButton from './FlipButton'; // Assuming FlipButton can accept style props
import { Ionicons } from '@expo/vector-icons'; // For button icons

// Removed Tamagui imports as they weren't essential for this structure anymore
// If you use Tamagui elsewhere, you might re-introduce YStack/XStack if preferred

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Use standard function declaration
function ImageViewModal({ visible, imageUri, onClose, onRemove }) {

  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true} // Keep transparent to see backdrop
      animationType="fade"
      onRequestClose={onClose} // Handle hardware back button on Android
    >
      {/* 1. Backdrop View - Centered, Darker */}
      <View style={styles.backdrop}>

        {/* 2. Inner Content Box View - Centered */}
        <View style={styles.contentBox}>

          {/* 3. Image Container View - Allow image to be large */}
          <View style={styles.imageContainer}>
            {/* Use RN Image */}
            <RNImage
              source={{ uri: imageUri }}
              style={styles.image} // Style ensures it fits container
              resizeMode="contain" // Keeps aspect ratio
            />
          </View>

          {/* 4. Button Container View */}
          <View style={styles.buttonContainer}>
             {/* Clearer Buttons */}
             <FlipButton
                onPress={onRemove}
                style={[styles.button, styles.removeButton]} // Apply base and specific style
                // Pass text/colors via props if FlipButton supports it,
                // otherwise, style the Text child directly if FlipButton accepts children
             >
                <Ionicons name="trash-outline" size={22} color="#dc3545" />
                <Text style={[styles.buttonText, styles.removeButtonText]}>Remove</Text>
             </FlipButton>

             <FlipButton
                onPress={onClose}
                style={[styles.button, styles.returnButton]} // Apply base and specific style
             >
               <Ionicons name="arrow-back-outline" size={22} color="#007bff" />
               <Text style={[styles.buttonText, styles.returnButtonText]}>Return</Text>
             </FlipButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker backdrop
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 15, // Add some padding around the content box
  },
  contentBox: {
    backgroundColor: '#ffffff', // White background for the content
    borderRadius: 15, // More rounded corners
    padding: 20, // Padding inside the box
    width: '95%', // Width relative to screen width
    maxWidth: 500, // Max width on larger devices
    maxHeight: '90%', // Max height relative to screen height
    alignItems: 'center', // Center items like image container and button container
    shadowColor: '#000', // Optional: add shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  imageContainer: {
    width: '100%', // Take full width of content box
    // Height will be determined by available space and aspect ratio
    // Or set a specific max height: maxHeight: windowHeight * 0.6,
    marginBottom: 25, // Space between image and buttons
    overflow: 'hidden', // Ensure image respects border radius if container has one
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 1, // Make it square, or remove if you want original aspect ratio to fill height
    // If removing aspectRatio, you might need to set a height or flex: 1 on the image container
    // height: windowHeight * 0.5, // Example fixed height
    borderRadius: 8, // Optional: slight rounding on image itself
  },
  buttonContainer: {
    flexDirection: 'row', // Arrange buttons side-by-side
    justifyContent: 'space-around', // Space them out evenly
    width: '100%', // Take full width for button spacing
    marginTop: 10, // Ensure some space from image if marginbottom wasn't enough
  },
  button: {
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Increased padding
    paddingHorizontal: 20, // Increased padding
    borderRadius: 8,
    borderWidth: 1, // Add border for definition
    flexGrow: 1, // Allow buttons to share space
    marginHorizontal: 10, // Space between buttons
    minWidth: 120, // Ensure buttons have minimum width
  },
  removeButton: {
    backgroundColor: '#f8d7da', // Light red background
    borderColor: '#f5c6cb', // Reddish border
  },
  returnButton: {
    backgroundColor: '#e0f0ff', // Light blue background
    borderColor: '#a0c8ff', // Bluish border
  },
  buttonText: {
    fontSize: 18, // Bigger text
    fontWeight: '600', // Semi-bold
    marginLeft: 8, // Space between icon and text
  },
  removeButtonText: {
      color: '#721c24', // Darker red text for contrast
  },
  returnButtonText: {
      color: '#004085', // Darker blue text for contrast
  }
});

export default ImageViewModal;