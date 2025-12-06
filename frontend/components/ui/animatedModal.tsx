import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ModalVariant = "bottom" | "center" | "dropdown";

interface AnimatedModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: ModalVariant;
  anchorPosition?: { top: number; right: number };
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isVisible,
  onClose,
  children,
  variant = "bottom",
  anchorPosition,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(
    variant === "bottom" ? SCREEN_HEIGHT : variant === "dropdown" ? -20 : 50,
  );
  const scale = useSharedValue(variant === "dropdown" ? 0.95 : 0.9);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, {
        duration: variant === "dropdown" ? 150 : 250,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, { damping: 20, stiffness: 350 });
      scale.value = withSpring(1, { damping: 18, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, {
        duration: variant === "dropdown" ? 120 : 200,
      });
      translateY.value = withTiming(-20, {
        duration: 120,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(variant === "dropdown" ? 0.95 : 0.9, {
        duration: variant === "dropdown" ? 120 : 200,
      });
    }
  }, [isVisible, variant]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: variant === "dropdown" ? opacity.value * 0.3 : opacity.value,
    pointerEvents: opacity.value === 0 ? "none" : "auto",
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!isVisible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <Animated.View
        className="bg-white z-50 absolute top-0 left-0"
        style={[modalStyle]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({});
