import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Animated,
  TextInput,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FloatingLabelInput = forwardRef(
  (
    {
      label = "input",
      value,
      onChangeText,
      style,
      alignRight = true,
      size = 30,
      secureTextEntry = false,
      ...props
    },
    ref
  ) => {
    const scale = size / 20;
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
    }));

    useEffect(() => {
      Animated.timing(animatedIsFocused, {
        toValue: isFocused || !!value ? 1 : 0,
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
        outputRange: ["grey", "black"],
      }),
      backgroundColor: "transparent",
      paddingHorizontal: 4 * scale,
      zIndex: 2,
    };

    // --- START: MODIFICATIONS ---

    // Define constants for icon positioning and styling
    const clearOffset = 10 * scale;
    const eyeSize = 24 * scale;
    const buttonSide = alignRight ? "left" : "right";
    const paddingSide = alignRight ? "paddingLeft" : "paddingRight";
    const iconAreaWidth = eyeSize + clearOffset + 5 * scale; // Calculate space for the icon + buffer

    // Adjust icon's vertical position for multiline inputs
    const iconTopPosition = props.multiline
      ? 12 * scale // Position near the top for multiline
      : (2 * size - eyeSize) / 2; // Keep centered for single line

    // Base style for the TextInput
    const textInputStyle = [
      styles.textInput,
      {
        width: "100%",
        height: 2 * size,
        fontSize: 16 * scale,
        paddingHorizontal: 10 * scale,
        borderRadius: 4 * scale,
        textAlign: alignRight ? "right" : "left",
      },
      props.inputStyle, // Apply custom styles like multiline height
    ];

    // If an icon is visible (clear button or password eye), add padding to that side
    if (value?.length > 0 || secureTextEntry) {
      textInputStyle.push({ [paddingSide]: iconAreaWidth });
    }

    // If multiline, add top padding to align the start of the text with the icon
    if (props.multiline) {
      textInputStyle.push({ paddingTop: iconTopPosition });
    }

    const iconContainerStyle = {
      position: "absolute",
      [buttonSide]: clearOffset,
      top: iconTopPosition,
      zIndex: 3,
      justifyContent: "center",
      alignItems: "center",
      height: eyeSize,
      width: eyeSize,
    };

    // --- END: MODIFICATIONS ---

    return (
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          style={[styles.containerRow, { marginVertical: 12 * scale }, style]}
        >
          <View style={styles.innerContainer}>
            <TextInput
              ref={inputRef}
              {...props}
              secureTextEntry={secureTextEntry && !showPassword}
              style={textInputStyle} // Use the dynamically generated style
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={onChangeText}
            />

            {secureTextEntry ? (
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={iconContainerStyle}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={eyeSize}
                  color="grey"
                />
              </TouchableOpacity>
            ) : (
              value?.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    onChangeText("");
                    inputRef.current?.focus();
                  }}
                  style={iconContainerStyle}
                >
                  {/* Using a proper icon instead of text 'x' */}
                  <Ionicons name="close-circle" size={eyeSize} color="grey" />
                </TouchableOpacity>
              )
            )}

            <Animated.Text style={labelStyle} pointerEvents="none">
              {label}
            </Animated.Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    alignSelf: "stretch",
  },
  innerContainer: {
    width: "100%",
    position: "relative",
    justifyContent: "center", // Center content vertically
  },
  textInput: {
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
});

export default FloatingLabelInput;
