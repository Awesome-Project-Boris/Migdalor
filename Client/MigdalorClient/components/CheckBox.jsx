import React from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";

// Define your own checkbox component with an "alignRight" prop
const AlignedBouncyCheckbox = ({
  alignRight = false,
  containerStyle,
  textStyle,
  ...rest
}) => {
  // If alignRight is true, apply row-reverse styling and right-aligned text
  const customContainerStyle = alignRight
    ? [
        {
          flexDirection: "row-reverse",
          justifyContent: "flex-end",
          alignItems: "center",
        },
        containerStyle,
      ]
    : containerStyle;
  const customTextStyle = alignRight
    ? [{ textAlign: "right" }, textStyle]
    : textStyle;

  return (
    <BouncyCheckbox
      containerStyle={customContainerStyle}
      textStyle={customTextStyle}
      {...rest}
    />
  );
};

export default AlignedBouncyCheckbox;
