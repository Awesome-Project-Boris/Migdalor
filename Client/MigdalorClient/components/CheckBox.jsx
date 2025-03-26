import React from "react";
import { StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const Checkbox = ({
  alignRight = true,
  text = "Remember Me",
  onPress,
  size = 35,
  fillColor = "black",
  unFillColor = "transparent",
  ...rest
}) => {
  return (
    <BouncyCheckbox
      size={size}
      fillColor={fillColor}
      unFillColor={unFillColor}
      text={text}
      iconStyle={styles.icon}
      innerIconStyle={styles.innerIcon}
      textStyle={{
        ...styles.text,
        textAlign: alignRight ? "right" : "left",
      }}
      style={{
        flexDirection: alignRight ? "row-reverse" : "row",
        justifyContent: alignRight ? "flex-end" : "flex-start",
        alignItems: "center",
        paddingBottom: 5,
      }}
      onPress={onPress}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    // You can add any container styles if needed.
  },
  icon: {
    borderRadius: 7,
    borderWidth: 2,
  },
  innerIcon: {
    borderRadius: 7,
  },
  text: {
    textDecorationLine: "none",
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Checkbox;
