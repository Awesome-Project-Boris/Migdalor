import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  TextInput,
  View,
  StyleSheet,
  I18nManager,
} from "react-native";

const FloatingLabelInput = ({
  label = "input",
  value,
  onChangeText,
  style,
  alignRight = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    [alignRight ? "right" : "left"]: 10,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [10, -25],
    }),
    fontSize: 16,
    textAlign: alignRight ? "right" : "left",
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#000"],
    }),
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    zIndex: 2,
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        {...props}
        style={[
          styles.textInput,
          { textAlign: alignRight ? "right" : "left" },
          props.inputStyle,
        ]}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
      />
      <Animated.Text style={labelStyle} pointerEvents="none">
        {label}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginVertical: 12,
  },
  textInput: {
    height: 40,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
});

export default FloatingLabelInput;
