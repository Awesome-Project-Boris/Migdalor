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
  Text,
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

    // Offsets
    const clearOffset = 10 * scale;
    const eyeSize = 24 * scale;
    const buttonSide = alignRight ? "left" : "right";

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
              style={[
                styles.textInput,
                {
                  width: "100%",
                  height: 2 * size,
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

            {secureTextEntry ? (
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  [buttonSide]: clearOffset,
                  top: (2 * size - eyeSize) / 2,
                  zIndex: 3,
                }}
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
                  style={{
                    position: "absolute",
                    [buttonSide]: clearOffset,
                    top: (2 * size - eyeSize) / 2,
                    zIndex: 3,
                  }}
                >
                  <Text style={{ fontSize: eyeSize, color: "grey" }}>×</Text>
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
  },
  textInput: {
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
});

export default FloatingLabelInput;
