import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import * as Animatable from "react-native-animatable";
import { useRouter } from "expo-router";
import { useMainMenuEdit } from "../context/MainMenuEditProvider";
import FlipButton from "./FlipButton";
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get("window").width;

// Choose your two colors:
const flashColor1 = "#fafafa"; // normal button color
const flashColor2 = "#006aab"; // alternate flash color for the flash effect

const flashAnimation = {
  0: { backgroundColor: flashColor1 },
  0.5: { backgroundColor: flashColor2 },
  1: { backgroundColor: flashColor1 },
};

export default function MainMenuButtons({ data, onDragEnd }) {
  const router = useRouter();

  const { editing } = useMainMenuEdit();

  const renderItem = ({ item, drag, isActive }) => {
    const handleLongPress = editing ? drag : undefined;
    const handlePress = () => {
      if (!editing && item.destination) {
        console.log("Navigating to:", item.destination);
        router.navigate(item.destination);
      } else if (!editing && !item.destination) {
         console.log("No destination for:", item.name);
      }
    };

    if (!data || data.length === 0) {
      return null; 
   }

    return (
      <Animatable.View
        animation={editing ? flashAnimation : undefined}
        iterationCount={editing ? "infinite" : 1}
        duration={4000}
        style={[styles.item, isActive && styles.activeItem]}
      >
        <FlipButton
          onLongPress={handleLongPress}
          delayLongPress={300}
          disabled={isActive || (!editing && !item.destination)} // Disable press if not editing AND no destination
          onPress={handlePress}
          style={styles.touchable}
          flipborderwidth={5}
          bgColor={flashColor1} // Pass initial color if needed by FlipButton
          // Pass text color if needed, or let FlipButton handle defaults
        >
          <Text style={styles.itemText}>{item.name}</Text>
        </FlipButton>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={data} 
        onDragEnd={onDragEnd}
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
    alignSelf: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    // For iOS shadow, use:
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  touchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 24,
    color: "#000",
  },
  activeItem: {
    opacity: 0.7,
    backgroundColor: "#388E3C",
  },
});
