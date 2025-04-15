import React, { useState, useContext } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import FlipButton from '../components/FlipButton';
import LabeledTextInput from '../components/LabeledTextInput';
import ImageViewModal from '../components/ImageViewModal';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Card, H2, Paragraph, XStack, YStack, Image, Spinner } from 'tamagui';
import { MarketplaceContext } from '../context/MarketplaceProvider';

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import Header from '../components/Header';
import {  useRouter } from "expo-router";
import { Toast } from 'toastify-react-native';
import { useTranslation } from 'react-i18next';



const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AddNewItem() {
  const { t } = useTranslation();
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mainImage, setMainImage, extraImage, setExtraImage } = useContext(MarketplaceContext);

  const ITEM_NAME_LIMIT = 50;
  const DESCRIPTION_LIMIT = 200;

  

  const router = useRouter();

  const hasUnsavedChanges = () =>
    itemName.trim() !== '' ||
    itemDescription.trim() !== '' ||
    mainImage !== null ||
    extraImage !== null;

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    setShowConfirm(false);
    resetState();
    router.back();
  };

  const resetState = async () => {
    setItemName('');
    setItemDescription('');
    await safeDeleteFile(mainImage);
    await safeDeleteFile(extraImage);
    setMainImage(null);
    setExtraImage(null);
  };


  const handleSubmit = async () => {
    const dataToSend = { itemName, itemDescription, mainImage, extraImage };
    
    setIsSubmitting(true);

    try
    {
        // LOGIC TO SUBMIT NEW ITEM DATA + DATA NEEDED FOR DB 
        // SHOW TOAST BASED ON OUTCOME. THEN NAVIGATE BACK
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = true // FOR NOW

        if (result)
        {
            console.log("Success!")
            Toast.show({
              type: 'success', // Type for styling (if themes are set up)
              text1: 'Submitted!', // Main text
              text2: 'Holy cow! you did it!', // Sub text
              duration: 3500, // Custom duration
               position: 'top' // Example: 'top' or 'bottom'
            });
            resetState();
        }
        else
        {
          Toast.show({
            type: 'error',
            text1: 'Epic failure',
            text2: 'What the hell went wrong?',
            duration: 5000, // Longer duration for errors?,
            position: 'top'
          });
        }

    }
    catch(error)
    {
        console.log("Error occured: " + error)
    }
    finally
    {
      setIsSubmitting(false);
      setTimeout(() => router.back(), 0);
    }
  };

  // In AddNewItemScreen.jsx

  const pickImage = async (setImage) => {

  Alert.alert(
    "Select Image Source",
    "Choose an option",
    [
      {
        text: "Take Photo",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.75,
          });
          if (!result.canceled && result.assets) {
            const sourceUri = result.assets[0].uri;
            // --- Copy file and set NEW URI ---
            try {
                const newUri = await copyImageToAppDir(sourceUri, 'camera');
                setImage(newUri); // Set state with the PERSISTENT URI
            } catch (copyError) {
                console.error("Error copying camera image:", copyError);
                Alert.alert("Error", "Could not save image.");
                setImage(null); // Clear image on error
            }
          }
        },
      },
      {
        text: "Choose From Library",
        onPress: async () => {
          console.log("Attempting to launch image library...");
          try {
            let result = await ImagePicker.launchImageLibraryAsync({
               allowsEditing: true,
               quality: 0.75,
            });
            if (!result.canceled && result.assets) {
              const sourceUri = result.assets[0].uri;
              // --- Copy file and set NEW URI ---
             try {
                 const newUri = await copyImageToAppDir(sourceUri, 'library');
                 setImage(newUri); // Set state with the PERSISTENT URI
             } catch (copyError) {
                 console.error("Error copying library image:", copyError);
                 Alert.alert("Error", "Could not save image.");
                 setImage(null); // Clear image on error
             }
            }
          } catch (error) { /* ... error handling ... */ }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]
  );
};

const copyImageToAppDir = async (sourceUri, prefix) => {
  try {
      const filename = `<span class="math-inline">\{prefix\}\-</span>{Date.now()}-${sourceUri.split('/').pop()}`; // Create a unique filename
      const destinationUri = FileSystem.documentDirectory + filename;

      console.log(`Copying from ${sourceUri} to ${destinationUri}`);
      await FileSystem.copyAsync({
          from: sourceUri,
          to: destinationUri,
      });
      console.log(`Copy successful: ${destinationUri}`);
      return destinationUri; 
  } catch (e) {
      console.error("FileSystem.copyAsync Error:", e);
      throw e; 
  }
};

const safeDeleteFile = async ( uri ) => {
  if (!uri || !uri.startsWith('file://')) return; // Only delete valid local file URIs

  try {
      console.log(`Attempting to delete file: ${uri}`);
      await FileSystem.deleteAsync(uri, { idempotent: true }); // idempotent: true prevents errors if file doesn't exist
      console.log(`Successfully deleted or file did not exist: ${uri}`);
  } catch (error) {
      console.error(`Error deleting file ${uri}:`, error);
  }
};

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>

          <View style={styles.headerRow}>
            <Text style={styles.title}>{t(`MarketplaceNewItemScreen_ItemName`)}</Text>
          </View>

          <FloatingLabelInput
            label={t(`MarketplaceNewItemScreen_ItemName`)}
            value={itemName}
            onChangeText={(text) => text.length <= ITEM_NAME_LIMIT && setItemName(text)}
          />
          <Text style={styles.charCount}>{itemName.length}/{ITEM_NAME_LIMIT}</Text>
          <FloatingLabelInput
            label={t(`MarketplaceNewItemScreen_ItemDescription`)}
            value={itemDescription}
            onChangeText={(text) => text.length <= DESCRIPTION_LIMIT && setItemDescription(text)}
            multiline={true}
          />
          <Text style={styles.charCount}>{itemDescription.length}/{DESCRIPTION_LIMIT}</Text>

          <XStack space="$3" justifyContent="center" alignItems="center" marginVertical="$4">
            <Card
              elevate width={150} height={150} borderRadius="$4" overflow="hidden" margin={10}
              onPress={() => {
                if (mainImage) {
                  console.log("Navigating to view image: main");
                  router.push({
                    pathname: '/ImageViewScreen', // Use correct screen name
                    params: { imageUri: mainImage, imageType: 'main' }
                  });
                } else {
                  pickImage(setMainImage);
                }
              }}
            >

              {mainImage ? ( 
                 <>
                  <Card.Background>
                  <ExpoImage
                   source={{ uri: mainImage }} 
                   style={StyleSheet.absoluteFill} 
                   contentFit="cover" 
                  />
                  </Card.Background>
                  <YStack f={1} jc="center" ai="center" backgroundColor="rgba(0,0,0,0.4)">
                    <Paragraph theme="alt2">Main image chosen</Paragraph>
                  </YStack>
                 </>
               ) : (
                <YStack f={1} jc="center" ai="center" p="$2">
                  <H2 size="$5">No Main Image</H2>
                  <Paragraph theme="alt2">Tap to choose</Paragraph>
                </YStack>
              )}
            </Card>

            <Card
              elevate width={150} height={150} borderRadius="$4" overflow="hidden"
              onPress={() => {
                if (extraImage) {
                  console.log("Navigating to view image: extra");
                  router.push({
                    pathname: '/ImageViewScreen',
                    params: { imageUri: extraImage, imageType: 'extra' }
                  });
                } else {
                  pickImage(setExtraImage);
                }
              }}
            >
              {extraImage ? ( 
                 <>
                  <Card.Background>
                  <ExpoImage
                   source={{ uri: extraImage }} 
                   style={StyleSheet.absoluteFill} 
                   contentFit="cover" 
                  />
                  </Card.Background>
                  <YStack f={1} jc="center" ai="center" backgroundColor="rgba(0,0,0,0.4)">
                    <Paragraph theme="alt2" color="$color">Extra image chosen</Paragraph>
                  </YStack>
                 </>
               ) : ( 
                <YStack f={1} jc="center" ai="center" p="$2">
                  <H2 size="$5">No Extra Image</H2>
                  <Paragraph theme="alt2">Tap to choose</Paragraph>
                </YStack>
              )}
            </Card>
          </XStack>

          <View style={styles.buttonRow}>
          <FlipButton
            onPress={handleSubmit}
            bgColor="white"
            textColor="black"
            style={styles.submitButton}
            disabled={isSubmitting} // <<< Disable button when submitting
          >
            {isSubmitting ? (
              <Spinner size="small" color="$color" /> // Use appropriate Tamagui color token or hardcoded color
            ) : (

              <Text style={styles.buttonLabel}>{t("MarketplaceSearchItem_SubmitButton")}</Text>
            )}
          </FlipButton>
            <FlipButton onPress={handleCancel} bgColor="white" textColor="black" style={styles.cancelButton}>
              <Text style={styles.buttonLabel}>{t("MarketplaceSearchItem_CancelButton")}</Text>
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

    </>
    )}

const styles = StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 5 },
    contentContainer: { width: '100%', maxHeight: SCREEN_HEIGHT * 0.85, padding: 20, borderRadius: 12, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  returnButton: { marginRight: 16, padding: 8 },
  title: { flex: 1, fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  charCount: { alignSelf: 'flex-end', marginTop: -5, marginBottom: 15, fontSize: 20, color: '#666' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 },
  submitButton: { paddingVertical: 15, paddingHorizontal: 25, borderRadius: 8, width: '40%', alignItems: 'center' },
  cancelButton: { paddingVertical: 15, paddingHorizontal: 25, borderRadius: 8, width: '40%', alignItems: 'center' },
  buttonLabel: { fontSize: 20, fontWeight: 'bold' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmContainer: { width: '80%', padding: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center' },
  confirmText: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  confirmButtonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' },
  confirmButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '40%', alignItems: 'center' }
});
