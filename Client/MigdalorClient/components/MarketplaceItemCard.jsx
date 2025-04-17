import { useTranslation } from 'react-i18next';
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
// Import Globals to construct the image URL
import { SCREEN_WIDTH, Globals } from "../app/constants/Globals";

// Define a placeholder image for when no image is available
const placeholderImage = require('../assets/images/tempItem.jpg');

function MarketplaceItemCard({ data, onPress }) {
  const { t } = useTranslation();

  // Construct the full image URL if mainImagePath exists, otherwise use placeholder
  const imageUrl = data?.mainImagePath
    ? { uri: `${Globals.API_BASE_URL}${data.mainImagePath}` } // Prepend base URL
    : placeholderImage; // Fallback to the placeholder

    // console.log("Card Image URL:", imageUrl.uri || "Using placeholder"); // Optional: Log image URL

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={styles.image}
        source={imageUrl} // Use the dynamically determined image source
        // Add an error handler for debugging image loading issues
        onError={(e) => console.log(`Error loading image ${imageUrl.uri || 'placeholder'}:`, e.nativeEvent.error)}
      />

      {/* Remove the console.log(data.itemImage1) */}

      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={2}>{data?.title || t('MarketplaceItemCard_Untitled')}</Text>
        <Text style={styles.sellerName}>{data?.sellerName || t('MarketplaceItemCard_UnknownSeller')}</Text>
      </View>

      <View style={styles.moreInfoContainer}>
         {/* Keep the translation for the button text */}
        <Text style={styles.moreInfoText}>{t("MarketplaceScreen_MoreDetailsButton")}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 150, // Use minHeight to allow content growth if text wraps
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row', // Keep row layout
    alignItems: 'center', // Vertically center image and info container
    padding: 10, // Adjusted padding
    marginVertical: 8,
    borderColor: '#ddd', // Lighter border
    borderWidth: 1,
    shadowColor: '#000', // Add subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8, // Slightly less rounded corners
    marginRight: 15, // Space between image and text
    backgroundColor: '#e0e0e0', // Background color for placeholder or while loading
  },
  infoContainer: {
    flex: 1, // Allow this container to take up remaining space
    justifyContent: 'center', // Vertically center text content
    height: '100%', // Ensure it takes full height for alignment
    paddingRight: 5, // Prevent text touching edge
  },
  itemName: {
    fontSize: 18, // Slightly smaller for potentially longer titles
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6, // Adjusted margin
  },
  sellerName: {
    fontSize: 14, // Smaller size for seller name
    color: '#555',
    marginBottom: 20, // Add space above the "more info" text
  },
  moreInfoContainer: {
    position: 'absolute',
    bottom: 8, // Position near the bottom
    // Align based on the infoContainer, not the whole card width
    left: 135, // Start after image width + margin (120 + 15)
    right: 10, // Padding from right edge
    alignItems: 'flex-start', // Align text to the start (left in LTR, right in RTL?)
  },
  moreInfoText: {
    fontSize: 12, // Smaller text for "more details"
    color: '#999',
  },
});

export default MarketplaceItemCard;