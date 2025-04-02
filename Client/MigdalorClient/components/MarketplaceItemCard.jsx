import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { SCREEN_WIDTH } from "../app/constants/Globals";

function MarketplaceItemCard({ data, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={styles.image}
        source={require('../assets/images/tempItem.jpg')} 
      />

      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{data.itemName}</Text>
        <Text style={styles.sellerName}>{data.sellerName}</Text>
      </View>

      <View style={styles.moreInfoContainer}>
        <Text style={styles.moreInfoText}>לחצו לפרטים נוספים</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  sellerName: {
    fontSize: 16,
    color: '#444',
  },
  moreInfoContainer: {
    position: 'absolute',
    bottom: 0,  
    alignItems: 'center',
    left: 0,
    right: 0,
},
  moreInfoText: {
    fontSize: 20,
    color: '#b1b1b1',
  },
});

export default MarketplaceItemCard;


