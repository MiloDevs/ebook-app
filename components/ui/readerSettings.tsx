import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Theme, Themes } from "@epubjs-react-native/core";
import CustomVerticalSlider from "./slider";
import * as Brightness from "expo-brightness";

const MIN_FONT_SIZE = 12; // e.g., 12px
const MAX_FONT_SIZE = 30; // e.g., 30px
const RANGE = MAX_FONT_SIZE - MIN_FONT_SIZE;

interface ReaderSettingsProps extends BottomSheetProps {
  open: boolean;
  changeTheme: (theme: Theme) => void;
  changeFontSize: (size: string) => void;
}

export const ReaderSettings = ({
  open = false,
  changeTheme,
  changeFontSize,
  ...props
}: ReaderSettingsProps) => {
  const [brightness, setBrightness] = useState(0.5);
  // ref
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setBrightness(currentBrightness);
      }
    })();
    if (open) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const adjustBrightness = async (value: number) => {
    setBrightness(value);
    const { status } = await Brightness.requestPermissionsAsync();
    if (status === "granted") {
      Brightness.setSystemBrightnessAsync(brightness);
    }
  };

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {}, []);

  // renders
  return (
    <BottomSheet
      enablePanDownToClose={true}
      ref={sheetRef}
      index={-1}
      onChange={handleSheetChanges}
      {...props}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text className="font-hepta_regular text-small mb-2">
          Reader Settings
        </Text>
        <View className="w-full flex-row gap-2">
          <View className="w-1/2">
            <Text className="font-hepta_regular text-small">Theme</Text>
            <View className="border border-gray_25 rounded-full p-2 flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => changeTheme(Themes.LIGHT)}
                className="size-12 rounded-full border border-gray_20 bg-white"
              ></TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeTheme(Themes.DARK)}
                className="size-12 rounded-full border border-gray_50 bg-gray_100"
              ></TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeTheme(Themes.SEPIA)}
                className="size-12 rounded-full border border-gray_20 bg-amber-100"
              ></TouchableOpacity>
            </View>
          </View>
          <View className="w-1/2 flex-row justify-between">
            <CustomVerticalSlider
              onChange={(val) => {
                // 1. Calculate the final font size (integer)
                const newFontSize = Math.round(MIN_FONT_SIZE + RANGE * val);

                // 2. Update the state with the string value
                changeFontSize(`${newFontSize}px`);
              }}
              sliderIcon="mingcute:font-size-line"
            />
            <CustomVerticalSlider
              key="slide-2"
              initialValue={brightness}
              onChange={adjustBrightness}
              sliderIcon="mingcute:sun-line"
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});
