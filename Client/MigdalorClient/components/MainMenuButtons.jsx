import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import { useMainMenuEdit } from '../context/MainMenuEditProvider';

const initialData = [
  { key: 'menu1', name: 'פרופיל', destination: 'Profile' },
  { key: 'menu2', name: 'חוגים ופעילויות', destination: '' },
  { key: 'menu3', name: 'שוק', destination: '' },
  { key: 'menu4', name: 'וועד', destination: '' },
  { key: 'menu5', name: 'שעות פעילות', destination: '' },
  { key: 'menu6', name: 'מפה', destination: '' },
  { key: 'menu7', name: 'Menu 7', destination: '' },
  { key: 'menu8', name: 'Menu 8', destination: '' },
  { key: 'menu9', name: 'Menu 9', destination: '' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

// Choose your two colors:
const flashColor1 = "#fafafa"; // normal button color
const flashColor2 = "#006aab"; // alternate flash color for the flash effect

// Define custom keyframes for a smooth flash (backgroundColor change)
const flashAnimation = {
  0: { backgroundColor: flashColor1 },
  0.5: { backgroundColor: flashColor2 },
  1: { backgroundColor: flashColor1 },
};

export default function MainMenuButtons() {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const { editing } = useMainMenuEdit();

  const renderItem = ({ item, drag, isActive }) => {
    const handleLongPress = editing ? drag : undefined;
    const handlePress = () => {
      if (!editing) {
        console.log('Navigating to:', item.destination);
        router.navigate(item.destination)
      }
    };

    return (
      <Animatable.View
        animation={editing ? flashAnimation : undefined}
        iterationCount={editing ? 'infinite' : 1}
        duration={4000} // duration of one cycle in ms
        style={[styles.item, isActive && styles.activeItem]}
      >
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={300}
          disabled={isActive}
          onPress={handlePress}
          style={styles.touchable}
        >
          <Text style={styles.itemText}>{item.name}</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={data}
        onDragEnd={({ data }) => setData(data)}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    width: SCREEN_WIDTH * 0.9,
    height: 100,
    backgroundColor: flashColor1,
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    // For iOS shadow, use:
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 24,
    color: '#000',
  },
  activeItem: {
    opacity: 0.7,
    backgroundColor: '#388E3C',
  },
});
