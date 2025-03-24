import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

const FlipButton = ({ text, children, onPress, bgColor, textColor, style }) => {
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
      {({ pressed }) =>
        // If children are provided, render them; otherwise, fallback to the text prop.
        children ? (
          children
        ) : (
          <Text style={[styles.textBase, { color: pressed ? bgColor : textColor }]}>
            {text}
          </Text>
        )
      }
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  textBase: {
    fontSize: 26,
    fontWeight: "bold",
  },
});

export default FlipButton;
