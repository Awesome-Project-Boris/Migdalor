import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const FlipButtonSizeless = ({
  text = "Button",
  children,
  onPress = () => {},
  onLongPress = () => {},
  delayLongPress = 500,
  disabled = false,
  bgColor = "#FFFFFF",
  textColor = "#000000",
  style,
  bordered = true,
  flipborderwidth = 2,
  testID = "flipButton",
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        styles.buttonBase,
        style,
        {
          backgroundColor: pressed ? textColor : bgColor,
          ...(bordered && {
            borderWidth: flipborderwidth,
            borderColor: pressed ? bgColor : textColor,
          }),
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      {({ pressed }) => {
        const dynamicTextStyle = { color: pressed ? bgColor : textColor };

        const renderChildWithStyle = (child) => {
          if (React.isValidElement(child)) {
            // This logic correctly clones children (like other Text or Icon components)
            // and passes down the dynamic color style.
            return React.cloneElement(child, {
              style: [child.props.style, dynamicTextStyle],
              children: child.props.children
                ? React.Children.map(child.props.children, renderChildWithStyle)
                : child.props.children,
            });
          }

          // If a child is just a string, wrap it in the standard Text component.
          return (
            <Text style={[styles.textBase, dynamicTextStyle]}>
              {child}
            </Text>
          );
        };

        return children ? (
          React.Children.map(children, renderChildWithStyle)
        ) : (
          // The default case also uses the standard Text component now.
          <Text style={[styles.textBase, dynamicTextStyle]}>
            {text}
          </Text>
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
    fontSize: 18,
    fontWeight: "bold",
    pointerEvents: "none",
  },
});

export default FlipButtonSizeless;
