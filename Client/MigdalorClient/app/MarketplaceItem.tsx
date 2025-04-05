// app/marketplace/[itemId].jsx (New File)

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { Image, YStack } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MarketplaceContext } from '../context/MarketplaceProvider'; 
import FlipButton from '../components/FlipButton'; 
import Header from '../components/Header'; 
import { Ionicons } from '@expo/vector-icons';


const SCREEN_HEIGHT = Dimensions.get('window').height;

// Define Item type (copy from context or import if shared)
interface ItemData {
  id: string;
  itemImage1: string;
  itemImage2: string;
  itemName: string;
  itemDescription: string;
  sellerName: string;
  sellerId: string;
  sellerEmail: string;
  sellerPhoneNumber: string;
  publishDate: string;
}


export default function MarketplaceItemScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>(); // Get ID from route: /marketplace/[itemId]
  const { getItemById } = useContext(MarketplaceContext);
  const [item, setItem] = useState<ItemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItem = () => {
        if (!itemId) return;
        setIsLoading(true);
        // Call the context function to get the item
        const foundItem = getItemById(itemId);
        setItem(foundItem || null);
        setIsLoading(false);
    };
    loadItem();
}, [itemId, getItemById]);

  if (isLoading) {
    // Use Tamagui Spinner or RN ActivityIndicator
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Header /> {/* Or Stack header */}
        <Text>Item not found.</Text>
        <FlipButton onPress={() => router.back()} style={{}} >
          <Text>Go back</Text>
        </FlipButton>
      </View>
    );
  }

  // If item is found, render the details (adapted from your modal)
  return (
    <>
      <Header /> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>

          <Text style={styles.title}>{item.itemName}</Text>
          <Text style={styles.h2}>Seller: {item.sellerName}</Text>

          {item.itemImage1 && (
             <Image style={styles.image} source={require('../assets/images/tempItem.jpg')} objectFit="contain" />

          )}
          <Text style={styles.h2}>{item.itemDescription} :תיאור מוצר</Text>
          {item.itemImage2 && (
             <Image style={styles.image} source={require('../assets/images/tempItem.jpg')} objectFit="contain" />
          )}

<YStack width="90%" space="$3" marginTop="$4" alignItems="center">
            <Text style={styles.h2}>פרטי יצירת קשר</Text>

            {/* Phone Call Button */}
            <FlipButton
              bgColor="#28a745" // Green
              textColor="white"
              style={styles.contactButton} // Use your common style
              onPress={async () => { /* ... Phone Linking logic remains the same ... */
                  const phoneNumber = item.sellerPhoneNumber;
                  const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
                  try {
                      const supported = await Linking.canOpenURL(phoneUrl);
                      if (supported) { await Linking.openURL(phoneUrl); }
                      else { Alert.alert(`Error`, `Cannot make phone calls`); }
                  } catch (error) { Alert.alert('Error', 'Could not open phone dialer.'); }
              }}
            >
              {/* Use children instead of text prop */}
              <View style={styles.buttonContent}>
                <Ionicons name="call-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.contactButtonText}>Call {item.sellerName}</Text>
              </View>
            </FlipButton>

            {/* WhatsApp Button */}
            <FlipButton
              bgColor="#25D366" 
              textColor="white"
              style={styles.contactButton}
              onPress={async () => { 
                const rawPhoneNumber = item.sellerPhoneNumber;

                const formattedNumber = `+972${rawPhoneNumber.replace('-', '').substring(1)}`;

                const message = `Hello, this is about your item, ${item.itemName}`;
                const encodedMessage = encodeURIComponent(message);

                console.log(`Attempting WhatsApp with formatted number: ${formattedNumber} and message: ${message}`);

                const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;

                  try {
                      const supported = await Linking.canOpenURL(whatsappUrl);
                      if (supported) { await Linking.openURL(whatsappUrl); }
                      else { Alert.alert(`Error`, `WhatsApp is not installed.`); }
                  } catch (error) { Alert.alert('Error', 'Could not open WhatsApp.'); }
              }}
            >
              {/* Use children instead of text prop */}
              <View style={styles.buttonContent}>
                 <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.buttonIcon} />
                 <Text style={styles.contactButtonText}>Message on WhatsApp</Text>
              </View>
            </FlipButton>

            {/* Email Button */}
            <FlipButton
              bgColor="#347af0" // Blue
              textColor="white"
              style={styles.contactButton}
              onPress={async () => { /* ... Email Linking logic remains the same ... */
                  const to = item.sellerEmail;
                  const subject = encodeURIComponent(`About your item: ${item.itemName}`);
                  const mailUrl = `mailto:${to}?subject=${subject}`;
                  try {
                      const supported = await Linking.canOpenURL(mailUrl);
                      if (supported) { await Linking.openURL(mailUrl); }
                      else { Alert.alert(`Error`, `Cannot open email client.`); }
                  } catch (error) { Alert.alert('Error', 'Could not open email client.'); }
              }}
            >
              {/* Use children instead of text prop */}
               <View style={styles.buttonContent}>
                 <Ionicons name="mail-outline" size={20} color="white" style={styles.buttonIcon} />
                 <Text style={styles.contactButtonText}>Email {item.sellerName}</Text>
              </View>
            </FlipButton>
          </YStack>

          <Text style={styles.detailText}>Publish date: {item.publishDate}</Text>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
    container: { // Base container if needed
        flex: 1,
        alignItems: 'center',
    },
    scrollContent: { // For ScrollView
      padding: 20,
      alignItems: 'center',
      marginTop: 60
    },
    contentContainer: { // Inner content container
      width: '100%',
      maxWidth: 600, // Max width on larger screens
      alignItems: 'center',
      paddingBottom: 40, // Ensure space at bottom
    },
    title: {
      fontWeight: 'bold',
      fontSize: 28, // Slightly smaller?
      marginBottom: 20,
      textAlign: 'center',
    },
    detailText: {
       fontSize: 16,
       marginBottom: 15,
       marginTop: 30,
       textAlign: 'center',
    },
    image: {
      width: '90%', // Responsive width
      aspectRatio: 1, // Make it square, or adjust as needed
      height: undefined, // Let aspectRatio control height
      marginBottom: 20,
      borderRadius: 10,
      backgroundColor: '#eee', // Placeholder background
    },
    contacts: {
      width: '90%',
      padding: 15,
      borderWidth: 1,
      borderColor: '#ccc', // Lighter border
      borderRadius: 10,
      marginBottom: 20,
      alignItems: 'center',
      backgroundColor: '#f9f9f9', // Slight background
    },
    contactDetail: {
       fontSize: 16,
       marginBottom: 5,
    },
    buttonContent: {
      flexDirection: 'row', // Arrange icon and text side-by-side
      alignItems: 'center', // Center items vertically
      justifyContent: 'center', // Center items horizontally
    },
    buttonIcon: {
      marginRight: 8, // Add space between icon and text
    },
    contactButtonText: { // Style for the text inside the button
      fontSize: 18, // Adjust as needed
      color: 'white', // Match button textColor (or set individually)
      fontWeight: 'bold',
    },
    // Your existing contactButton style (adjust padding if needed)
    contactButton: {
      width: '100%',
      borderRadius: 15,
      paddingVertical: 20,
      marginBottom: 20,
      marginVertical: 5,
    },
    // Your existing h2 style
     h2: {
      fontWeight: 'bold',
      fontSize: 20,
      marginBottom: 15,
      textAlign: 'center',
    },
});