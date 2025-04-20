import React from "react";
import { StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useTranslation } from "react-i18next";

const Checkbox = ({
  alignRight = true,
  text,
  onPress,
  size = 35,
  fillColor = "black",
  unFillColor = "transparent",
  ...rest
}) => {
  const {t} = useTranslation()
  const label = text ?? t("LoginScreen_rememberMe"); // default if no text prop
  return (
    <BouncyCheckbox
      size={size}
      fillColor={fillColor}
      unFillColor={unFillColor}
      text={label} 
      iconStyle={styles.icon}
      innerIconStyle={styles.innerIcon}
      textStyle={{
        ...styles.text,
        color: fillColor,
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
