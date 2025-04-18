import React, { useRef, useCallback } from "react";
import { Animated, Pressable } from "react-native";

/**
 * BouncyButton wraps its children in a Pressable and applies a springy scale animation on press.
 *
 * @param {React.ReactNode} children - Content inside the button
 * @param {function} onPress - Handler for press event
 * @param {function} onLongPress - Handler for long press event
 * @param {number} shrinkScale - Scale value when pressed (default 0.95)
 * @param {object} springConfig - Config for Animated.spring (e.g., { bounciness, speed })
 * @param {number} springConfig.bounciness - Bounciness of the spring
 * @param {number} springConfig.speed - Speed of the animation
 * @param {object} style - Style object applied to the Animated.View
 * @param {object} pressableProps - Additional props for the Pressable
 */
export default function BouncyButton({
  children,
  onPress,
  onLongPress,
  shrinkScale = 0.85,
  springConfig = { bounciness: 10, speed: 20 },
  style,
  pressableProps = {},
}) {
  // Animated value for scaling
  const scale = useRef(new Animated.Value(1)).current;

  // Animate to shrinkScale on press in
  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: shrinkScale,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }, [scale, shrinkScale, springConfig]);

  // Animate back to 1 on press out
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  }, [scale, springConfig]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...pressableProps}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
