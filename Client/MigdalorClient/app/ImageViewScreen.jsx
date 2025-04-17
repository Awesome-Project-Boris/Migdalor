// frontend/ImageViewScreen.jsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import FlipButton from '../components/FlipButton';
import { Ionicons } from '@expo/vector-icons';

export default function ImageViewScreen() {
  const { t } = useTranslation(); 
  const router = useRouter();
  // Get params passed during navigation
  const params = useLocalSearchParams();
  const {
      imageUri,
      altText = '', // Default to empty string
   } = params;

  const insets = useSafeAreaInsets();


  // --- Handler for the return button ---
  const handleReturn = () => {
    router.back();
  };

  // Check if URI is missing
  if (!imageUri || typeof imageUri !== 'string') { // Check if it's a non-empty string
    console.error("ImageViewScreen: Invalid or missing imageUri", imageUri);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('ImageViewScreen_ErrorNoImage')}</Text>
        <FlipButton onPress={handleReturn} style={styles.backButtonError} >
          <Text>{t('Common_BackButton')}</Text> 
        </FlipButton>
      </SafeAreaView>
    );
  }

  console.log(`ImageViewScreen displaying: URI=${imageUri}, Alt=${altText}`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.topButtonContainer, { top: insets.top }]}>
           <FlipButton onPress={handleReturn} style={styles.topButton} bgColor='white' textColor='black'>
                <Text style= {styles.buttonText}>{t('Common_BackButton')}</Text>
               <Ionicons name="arrow-back" size={28} color="black" />
           </FlipButton>

        </View>


        <ExpoImage
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
          alt= {altText}
          // Add placeholder for loading state
          placeholder={require('../assets/images/loading_placeholder.png')} 
          transition={300} // Smooth transition
          onError={(e) => console.error('[ExpoImage] Error loading image:', e?.error || 'Unknown error', 'URI:', imageUri)}
          onLoadStart={() => console.log('[ExpoImage] Load Start:', imageUri)}
          onLoad={(e) => console.log('[ExpoImage] Load Success:', e?.source)}
        />
      </View>

      <View style={styles.altTextContainer}>
              <Text style={styles.altTextStyle}>{altText}</Text>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out Back button and Info area
    alignItems: 'center', // Align items vertically
    paddingHorizontal: 15,
    paddingVertical: 10, // Adjust padding
    zIndex: 10,
    // Optional subtle background
    // backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topButton: { 
    padding: 8, 
    borderRadius: 20,
  },
  imageInfoContainer: { // Container for optional image details
    alignItems: 'flex-end', // Align text to the right
  },
  imageInfoText: { // Style for optional image details text
      color: 'rgba(200, 200, 200, 0.8)', // Semi-transparent white
      fontSize: 11,
      maxWidth: 150, // Prevent text from becoming too wide
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black', // Match theme
  },
  errorText: {
    fontSize: 18,
    color: '#ff8a8a', // Lighter red for dark background
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonError: { // Style for back button on error screen
      backgroundColor: '#555',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
  },
  buttonText:{ 
    fontSize: 20
  },
  altTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    padding: 10,
  },
  altTextStyle: {
    fontSize: 26, // Larger font size
    color: '#e0e0e0', // Light gray/off-white for readability on black
    textAlign: 'center', // Center the text
    lineHeight: 26, 
  }
});