import { COLORS } from "@/constants/colors";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  MeasureOnSuccessCallback,
  PanResponderGestureState,
} from "react-native";
import { View, Text, PanResponder, Dimensions } from "react-native";
import Iconify from "react-native-iconify/native";

interface SliderProps {
  initialValue?: number;
  sliderIcon?: string;
  onChange?: (value: number) => void;
}

const CustomVerticalSlider = ({
  initialValue = 0.5,
  sliderIcon,
  onChange,
}: SliderProps) => {
  // Use a state for the current value
  const [currentValue, setCurrentValue] = useState(0);
  const containerRef = useRef<View | null>(null);
  const [containerMeasure, setContainerMeasure] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;

    // Only run initialization logic if height is measured for the first time
    if (currentValue === 0 && containerMeasure === 0 && height > 0) {
      setContainerMeasure(height);
      // Initialize the pixel value using the initial ratio
      setCurrentValue(height * initialValue);
    }
  };

  const handleTouchMove = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const newMeasure = currentValue - gestureState.dy;
    const clampedMeasure = Math.round(
      Math.min(Math.max(newMeasure, 0), containerMeasure),
    );
    console.log(clampedMeasure);
    setCurrentValue(clampedMeasure);
    onChange && onChange(clampedMeasure / containerMeasure);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: handleTouchMove,
    onPanResponderRelease: () => {},
  });

  return (
    <View
      {...panResponder.panHandlers}
      ref={containerRef}
      onLayout={handleLayout}
      className="h-60 rounded-full justify-end relative border border-gray_25/20 bg-gray_0 w-20 overflow-hidden"
    >
      <View
        className="w-full bg-gray_25"
        style={{
          height: `${(currentValue / containerMeasure) * 100}%`,
        }}
      ></View>
      {sliderIcon && (
        <View className="absolute bottom-4 mx-auto items-center justify-end left-0 right-0">
          <Text>
            <Iconify icon={sliderIcon} color={COLORS.gray_75} />
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomVerticalSlider;
