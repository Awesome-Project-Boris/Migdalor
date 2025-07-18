import React from "react";
import { View, StyleSheet, Dimensions } from "react-native"; // 'Text' import removed
import DraggableFlatList from "react-native-draggable-flatlist";
import * as Animatable from "react-native-animatable";
import { useRouter } from "expo-router";
import { useMainMenuEdit } from "../context/MainMenuEditProvider";
import FlipButton from "./FlipButton";
import StyledText from "@/components/StyledText.jsx"; // Import StyledText

const SCREEN_WIDTH = Dimensions.get("window").width;

// Jiggle animation inspired by iOS home screen icons
const jiggle = {
  0: { rotate: "0deg" },
  0.2: { rotate: "-2deg" },
  0.4: { rotate: "2deg" },
  0.6: { rotate: "-2deg" },
  0.8: { rotate: "2deg" },
  1: { rotate: "0deg" },
};

export default function MainMenuButtons({ data, onDragEnd }) {
  const router = useRouter();
  const { editing } = useMainMenuEdit();

  const renderItem = ({ item, drag, isActive }) => {
    const handleLongPress = editing ? drag : undefined;
    const handlePress = () => {
      if (!editing && item.destination) {
        router.navigate(item.destination);
      } else if (!editing) {
        console.log("No destination for:", item.name);
      }
    };

    return (
      <Animatable.View
        key={`${item.key}-${editing}`}
        animation={editing ? jiggle : undefined}
        duration={1600}
        easing="linear"
        iterationCount={editing ? "infinite" : 1}
        style={[styles.item, isActive && styles.activeItem]}
      >
        <FlipButton
          onLongPress={handleLongPress}
          delayLongPress={300}
          disabled={isActive || (!editing && !item.destination)}
          onPress={handlePress}
          style={styles.touchable}
          flipborderwidth={5}
        >
          {/* Replaced Text with StyledText */}
          <StyledText style={styles.itemText}>{item.name}</StyledText>
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
    minheight: 100,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: "center",
    justifyContent: "center",
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
    textAlign: "center",
    fontSize: 24, // Base font size is defined, so StyledText can scale it
    color: "#000",
  },
  activeItem: {
    opacity: 0.7,
    backgroundColor: "#388E3C",
  },
});