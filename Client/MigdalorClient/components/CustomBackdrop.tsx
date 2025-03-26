import React from 'react';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

/**
 * A custom backdrop that intercepts all touches ("pointerEvents='auto'")
 * and calls onPressClose() when tapped.
 */
const CustomBackdrop = ({
  style,
  animatedIndex,
  animatedPosition,
  onPressClose,
}: BottomSheetBackdropProps & { onPressClose: () => void }) => {
  return (
    <TouchableWithoutFeedback onPress={onPressClose}>
      <Animated.View
        pointerEvents="auto"
        style={[
          StyleSheet.absoluteFill, // fill the screen
          { backgroundColor: 'rgba(0,0,0,0.5)', }, // semi-transparent overlay
          style, // any animated styles from the bottom sheet library
        ]}
      />
    </TouchableWithoutFeedback>
  );
};

export default CustomBackdrop;
