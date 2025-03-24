import React from "react";
import { View, Text, TextInput, I18nManager, StyleSheet } from "react-native";

const LabeledTextInput = ({
  label,
  value,
  onChangeText,
  // Optional props to control sizing
  textInputHeight = 40,
  textInputFontSize = 16,
  // You can pass additional styles if needed
  inputStyle,
  labelStyle,
  containerStyle,
  ...restProps
}) => {
  // Create combined styles. The label’s font size is 80% of the input's.
  const combinedInputStyle = [
    styles.textInput,
    {
      height: textInputHeight,
      fontSize: textInputFontSize,
      textAlign: "right",
    },
    inputStyle,
  ];

  const combinedLabelStyle = [
    styles.label,
    {
      fontSize: textInputFontSize * 0.8,
      textAlign: "right",
      writingDirection: "rtl",
      // textAlign: I18nManager.isRTL ? "right" : "left",
    },
    labelStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={combinedLabelStyle}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={combinedInputStyle}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  label: {
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 10,
  },
});

export default LabeledTextInput;
