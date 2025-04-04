import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FlipButton from '../components/FlipButton';
import LabeledTextInput from '../components/LabeledTextInput';
import ImageViewModal from '../components/ImageViewModal';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Card, H2, Paragraph, XStack, YStack, Image, Spinner } from 'tamagui';
import { useToastController } from '@tamagui/toast';
import Header from '../components/Header';
import {  useRouter } from "expo-router";
import { Toast } from 'toastify-react-native';



const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AddNewItem() {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImageViewModal, setShowImageViewModal] = useState(false);
  const [imageToViewUri, setImageToViewUri] = useState(null);
  const [imageTypeToClear, setImageTypeToClear] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);


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
    rounter.back();
  };

  const resetState = () => {
    setItemName('');
    setItemDescription('');
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

  const pickImage = async (setImage) => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media Library Permission Status:', libraryPermission.status);
        if (libraryPermission.status !== 'granted') {
            Alert.alert('Permission needed', 'Permission to access media library is required!');
            return;
        }

        if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
          Alert.alert('Permissions needed', 'Camera and Media Library permissions are required!');
          return;
        }

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
                  base64: true
                });
                if (!result.canceled && result.assets) {
                  let base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
                  setImage(base64Uri);
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
                     base64: true,
                  });
                  if (!result.canceled && result.assets) {
                     let mimeType = result.assets[0].mimeType || 'image/jpeg';
                     let base64Uri = `data:${mimeType};base64,${result.assets[0].base64}`;
                     console.log("Image selected (base64):", base64Uri.substring(0, 50) + "...");
                     setImage(base64Uri);
                  }
                } catch (error) {
                  console.error("Error launching image library:", error);
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
    <>
    <Header/>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>

          <View style={styles.headerRow}>
            <Text style={styles.title}>New item listing</Text>
          </View>

          <FloatingLabelInput
            label={'שם המוצר'}
            value={itemName}
            onChangeText={(text) => text.length <= ITEM_NAME_LIMIT && setItemName(text)}
          />
          <Text style={styles.charCount}>{itemName.length}/{ITEM_NAME_LIMIT}</Text>
          <FloatingLabelInput
            label={`תיאור המוצר`}
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
                  console.log("clicking main.. setting type 'main'");
                  setImageToViewUri(mainImage);

                  setImageTypeToClear('main');
                  setShowImageViewModal(true);
                } else {
                  pickImage(setMainImage);
                }
              }}
            >

              {mainImage ? ( 
                 <>
                  <Card.Background>
                    <Image source={{ uri: mainImage }} position="absolute" top={0} left={0} right={0} bottom={0} contentFit="cover"/>
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
                  console.log("clicking extra.. setting type 'extra'");
                  setImageToViewUri(extraImage);
                  setImageTypeToClear('extra');
                  setShowImageViewModal(true);
                } else {
                  pickImage(setExtraImage);
                }
              }}
            >
              {extraImage ? ( 
                 <>
                  <Card.Background>
                    <Image source={{ uri: extraImage }} position="absolute" top={0} left={0} right={0} bottom={0} contentFit="cover"/>
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

              <Text style={styles.buttonLabel}>Submit</Text>
            )}
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

      <ImageViewModal
        visible={showImageViewModal}
        imageUri={imageToViewUri}
        onClose={() => {
          setShowImageViewModal(false);
          setImageToViewUri(null);
          setImageTypeToClear(null); 
        }}
        onRemove={() => {
          console.log('onRemove - imageTypeToClear is:', imageTypeToClear); 
          if (imageTypeToClear === 'main') {
            setMainImage(null);
          } else if (imageTypeToClear === 'extra') {
            setExtraImage(null);
          } else {
             console.error("onRemove: imageTypeToClear was not 'main' or 'extra'");
          }
          setShowImageViewModal(false);
          setImageToViewUri(null);
          setImageTypeToClear(null); 
        }}
      />
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
