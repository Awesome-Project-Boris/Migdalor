import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  TextInput,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

const FloatingLabelInput = ({
  label = "input",
  value,
  onChangeText,
  style,
  alignRight = true,
  size = 30, // optional size prop
  ...props
}) => {
  const scale = size / 20;
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null); // reference to the TextInput

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    [alignRight ? "right" : "left"]: 10 * scale,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [10 * scale, -25 * scale],
    }),
    fontSize: 16 * scale,
    textAlign: alignRight ? "right" : "left",
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#000"],
    }),
    backgroundColor: "transparent",
    paddingHorizontal: 4 * scale,
    zIndex: 2,
  };

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[styles.container, { marginVertical: 12 * scale }, style]}>
        <TextInput
          ref={inputRef}
          {...props}
          style={[
            styles.textInput,
            {
              height: 40 * scale,
              fontSize: 16 * scale,
              paddingHorizontal: 10 * scale,
              borderRadius: 4 * scale,
              textAlign: alignRight ? "right" : "left",
            },
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  textInput: {
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
});

export default FloatingLabelInput;
