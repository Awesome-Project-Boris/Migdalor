import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

const FlipButton = ({
  text = "Button",
  children,
  onPress,
  bgColor = "#FFFFFF",
  textColor = "#000000",
  style,
  bordered = true,
  flipborderwidth = 2,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        style,
        {
          backgroundColor: pressed ? textColor : bgColor,
          ...(bordered && {
            borderWidth: flipborderwidth,
            borderColor: pressed ? bgColor : textColor,
          }),
        },
      ]}
    >
      {({ pressed }) => {
        const dynamicTextStyle = { color: pressed ? bgColor : textColor };

        // Recursive helper to apply dynamic text style to all nested children.
        const renderChildWithStyle = (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              style: [child.props.style, dynamicTextStyle],
              children: child.props.children
                ? React.Children.map(child.props.children, renderChildWithStyle)
                : child.props.children,
            });
          }
          // Wrap non-element children (like strings) in a Text component.
          return (
            <Text style={[styles.textBase, dynamicTextStyle]}>{child}</Text>
          );
        };

        return children ? (
          React.Children.map(children, renderChildWithStyle)
        ) : (
          <Text style={[styles.textBase, dynamicTextStyle]}>{text}</Text>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 4px rgba(0, 0, 0, 0.25)",
  },
  textBase: {
    // fontSize: 26,
    fontWeight: "bold",
    pointerEvents: "none",
  },
});

export default FlipButton;
