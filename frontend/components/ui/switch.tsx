import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SwitchProps {
  on?: boolean;
  onValueChange?: (value: boolean) => void;
}

const TRANSLATE_DISTANCE = 40;

const BORDER_OFFSET = 2;

export const Switch = ({ on, onValueChange }: SwitchProps) => {
  const [isOn, setIsOn] = useState(on || false);

  const translateX = useSharedValue<number>(isOn ? TRANSLATE_DISTANCE : 0);

  useEffect(() => {
    translateX.value = withTiming(isOn ? TRANSLATE_DISTANCE : 0);
  }, [isOn, onValueChange, translateX]);

  useEffect(() => {
    if (on !== undefined && on !== isOn) {
      setIsOn(on);
    }
  }, [on, isOn]);

  const handlePress = () => {
    onValueChange && onValueChange(!isOn);
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value + BORDER_OFFSET,
      },
      {
        translateY: "-50%",
      },
    ],
  }));

  // --- Render ---
  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`${isOn ? "bg-primary" : "bg-gray_25 border-2  border-gray_50/50"} h-9 w-20 rounded-full relative`}
    >
      <Animated.View
        style={animatedStyles}
        className={`absolute -translate-y-1/2 top-1/2 w-7 h-7 rounded-full bg-white`}
      ></Animated.View>
    </TouchableOpacity>
  );
};
