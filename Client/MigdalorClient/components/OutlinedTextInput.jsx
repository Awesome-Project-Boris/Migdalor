import React from "react";
import { I18nManager, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

const OutlinedTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  textContentType,
  keyboardType,
  left,
  right,
}) => {
  const isRTL = I18nManager.isRTL;

  // Flip icons if provided
  const maybeFlipIcon = (iconProp) => {
    if (!iconProp) return null;
    return (
      iconProp &&
      React.cloneElement(iconProp, {
        style: [{ transform: [{ scaleX: -1 }] }, iconProp.props?.style],
      })
    );
  };

  return (
    <TextInput
      mode="outlined"
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textContentType={textContentType}
      keyboardType={keyboardType}
      left={maybeFlipIcon(left)}
      right={maybeFlipIcon(right)}
      style={[
        styles.input,
        style,
        {
          textAlign: "right",
          writingDirection: "rtl",
        },
      ]}
      contentStyle={{
        textAlign: "right",
        writingDirection: "rtl",
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
});

export default OutlinedTextInput;
