import React from 'react';
import { Modal, View, Text, Button, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import FlipButton from './FlipButton';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface MarketplaceItemModalProps {
  visible: boolean;
  item: {
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
  };
  onClose: () => void;
}

export default function MarketplaceItemModal({ visible, item, onClose }: MarketplaceItemModalProps) {
  if (!item) return null; // or a fallback

  return (
    <Modal visible={visible} transparent={true} animationType="slide" style={styles.modal}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
          <FlipButton onPress={() => onClose()} bgColor="white" textColor="black" style={styles.closeButton}>
                <Text style={styles.closeButtonText}>סגירה</Text>
          </FlipButton>
            <Text style={styles.title}>{item.itemName}</Text>
            <Text style={styles.h2}>Seller: {item.sellerName}</Text>
            <Image style={styles.image} source={require('../assets/images/tempItem.jpg')} /> 
            <Text style={styles.h2}>{item.itemDescription} :תיאור מוצר</Text>
            <Image style={styles.image} source={require('../assets/images/tempItem.jpg')} /> 
              <View style={styles.contacts}>
                <Text style={styles.h2}>פרטי יצירת קשר</Text>
                <Text style={styles.h2}>{item.sellerPhoneNumber} </Text>
                <Text style={styles.h2}>{item.sellerEmail}</Text>
              </View>
            <Text style={styles.h2}>Publish date: {item.publishDate}</Text>  
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxHeight: SCREEN_HEIGHT * 0.75, 
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  modalContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 30,
  },
  h2: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    marginBottom: 20,
    width: '70%',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  contacts:
  {
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'black',
  },
});



// item details

// id:
// itemImage1:
// itemImage2:
// itemName:
// itemDescription:
// sellerName:
// sellerId:
// sellerEmail:
// sellerPhoneNumber:
// publishDate: