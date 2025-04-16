// CURRENTLY ONLY SUPPORTS MARKETPLACE! CAN BE EXPANDED.

import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FlipButton from '../components/FlipButton'; 
import { MarketplaceContext } from '../context/MarketplaceProvider';

export default function ImageViewScreen() {
  const router = useRouter();

  const { imageUri, imageType } = useLocalSearchParams();
  const { setMainImage, setExtraImage } = useContext(MarketplaceContext); 

  const insets = useSafeAreaInsets(); // Get safe area distances

  // --- Handler for the remove button ---
  const handleRemove = () => {
    console.log(`Removing image type: ${imageType}`);
    if (imageType === 'main') {
      // Need a way to update state in AddNewItemScreen.
      // Calling context setter directly might work if AddNewItemScreen reads from context state.
      // If state is local to AddNewItemScreen, need a different mechanism (e.g., global state library).
      // For now, let's assume context holds setters (MODIFY CONTEXT IF NEEDED):
      if (setMainImage) { // Check if function exists in context
          setMainImage(null);
      } else {
          console.error("setMainImage function not found in context");
      }
    } else if (imageType === 'extra') {
      if (setExtraImage) { // Check if function exists in context
          setExtraImage(null);
      } else {
           console.error("setExtraImage function not found in context");
      }
    }
    router.back(); // Go back after attempting removal
  };

  // --- Handler for the return button ---
  const handleReturn = () => {
    router.back();
  };

  // Basic check if URI is missing
  if (!imageUri) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Image not found.</Text>
        <FlipButton onPress={handleReturn} style={styles.backButtonError} >
            <Text>חזור</Text>
        </FlipButton>
      </SafeAreaView>
    );
  }

  console.log(`Image URI: ${imageUri}`)
  return (
    // Use SafeAreaView for overall screen bounds respecting notches/status bars
    <SafeAreaView style={styles.safeArea}>

      {/* Main container with black background */}
      <View style={styles.container}>
        {/* Header area for buttons, positioned absolutely */}
        <View style={[styles.topButtonContainer, { top: insets.top }]}>
          <FlipButton onPress={handleReturn} style={styles.topButton} bgColor='white' textColor='black'>
             {/* You can use Ionicons here too */}
             <Text style={styles.topButtonText}>Return</Text>
          </FlipButton>
          <FlipButton onPress={handleRemove} style={styles.topButton} bgColor='white' textColor='red'>
            {/* You can use Ionicons here too */}
            <Text style={styles.topButtonText}>Remove</Text>
          </FlipButton>
        </View>
        <ExpoImage 
                    source={{ uri: imageUri }}
                    style={styles.image} // Use your previous style (flex: 1, width: '100%' etc.)
                    contentFit="contain" // Use contentFit
                    onError={(e) => console.log('[ExpoImage] Error:', e?.error || 'Unknown error')}
                    onLoad={(e) => console.log('[ExpoImage] Load Success:', e?.source)}
                />
      </View>
    </SafeAreaView>
  );
}

// --- Styles for the new screen ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // Make safe area black too
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Center image vertically
    alignItems: 'center', // Center image horizontally
    backgroundColor: 'black',
  },
  image: {
    flex: 1, // Allow image to grow/shrink
    width: '100%', // Take full width
    height: '100%', // Take full height (resizeMode='contain' will handle aspect ratio)
  },
  topButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between', // Place buttons at edges
    paddingHorizontal: 15,
    zIndex: 10, // Ensure buttons are on top
    backgroundColor: 'rgba(60,60,60,0.9)',
    paddingBottom: 15,
    paddingTop: 15
  },
  topButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    // Add background color via props for transparency
  },
  topButtonText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  backButtonError: {
      
  }
});