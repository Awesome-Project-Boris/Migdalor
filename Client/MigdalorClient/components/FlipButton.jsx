import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

const FlipButton = ({ text, onPress, bgColor, textColor, style }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        style,
        {
          backgroundColor: pressed ? textColor : bgColor,
        },
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[styles.textBase, { color: pressed ? bgColor : textColor }]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
  },
  textBase: {
    fontSize: 26,
    fontWeight: "bold",
  },
});

export default FlipButton;
