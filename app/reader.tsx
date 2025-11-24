import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Reader, Themes, useReader } from "@epubjs-react-native/core";
// import { useFileSystem } from '@epubjs-react-native/file-system'; // for Bare React Native project
import { useFileSystem } from "@milodevs/expo-file-system"; // for Expo project
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import CustomVerticalSlider from "@/components/ui/slider";
import { setVolume, VolumeManager } from "react-native-volume-manager";

import { ReaderSettings } from "@/components/ui/readerSettings";
import { throttle } from "@/lib/throttle";

export default function ReaderPage() {
  // Destructure all necessary hooks
  const {
    changeFontFamily,
    injectJavascript,
    changeFontSize,
    changeTheme,
    theme,
    toc,
    goToLocation,
    goNext,
    goPrevious,
    getMeta,
  } = useReader();
  const [settingsVisible, SetSettingsVisible] = useState(false);
  const { top } = useSafeAreaInsets();
  const [showChapters, SetShowChapters] = useState(false);
  const [prevVolume, SetPrevVolume] = useState(0);
  const [meta, setMeta]: {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  } | null = useState(null);
  const router = useRouter();

  useEffect(() => {
    VolumeManager.showNativeVolumeUI({ enabled: false });
    const volumeListener = VolumeManager.addVolumeListener((result) => {
      let { volume } = result;
      console.log(volume);
      if (prevVolume < volume && volume > 0.5) {
        goNext();
      } else if (prevVolume > volume && volume < 0.5) {
        goPrevious();
      }
      if (volume > 0.8) {
        VolumeManager.setVolume(0.5);
        volume = 0.45;
      } else if (volume < 0.2) {
        VolumeManager.setVolume(0.5);
        volume = 0.35;
      }

      SetPrevVolume(volume);
    });

    setMeta(getMeta());

    return () => {
      volumeListener.remove();
    };
  }, [toc, getMeta, goNext, goPrevious, prevVolume]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.body.background,
      }}
      className="relative flex-1 p-2"
    >
      <View className="flex flex-row mb-2 items-center justify-between">
        <TouchableOpacity onPress={() => router.dismiss()} className="p-2">
          <Text className="font-hepta_medium text-small">
            <Iconify icon="mingcute:left-line" color={COLORS.gray_50} />
          </Text>
        </TouchableOpacity>
        <View className="flex flex-row items-center gap-1">
          <TouchableOpacity className="p-2">
            <Text className="font-hepta_medium text-small">
              <Iconify icon="mingcute:bookmark-line" color={COLORS.gray_50} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => SetShowChapters(!showChapters)}
            className="p-2"
          >
            <Text className="font-hepta_medium text-small">
              <Iconify icon="mingcute:list-check-fill" color={COLORS.gray_50} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => SetSettingsVisible(!settingsVisible)}
            className="p-2"
          >
            <Text className="font-hepta_medium text-small">
              <Iconify icon="mingcute:book-6-line" color={COLORS.gray_50} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          marginTop: top + 48,
          display: showChapters ? "flex" : "none",
        }}
        className={`
          h-60
          bg-white
          border border-gray-200
          rounded-lg
          absolute
          right-2
          z-30
          p-3
        `}
      >
        <Text
          className="
            font-hepta_semibold
            text-lg
            text-gray-800
            mb-2
            border-b border-gray-100 pb-1
          "
        >
          Chapters
        </Text>

        <ScrollView className="flex-1">
          <FlatList
            data={toc}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.href}
                onPress={() => {
                  goToLocation(item.href);
                  SetShowChapters(false);
                }}
                className="py-1.5 px-1 rounded-md active:bg-blue-50 transition-colors"
              >
                <Text
                  className="
                    text-small
                    text-gray-600
                    font-hepta_regular
                  "
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </View>
      <View className="flex-1">
        <Reader
          src="https://cdn.milo-the.dev/books/The%20Sea%20of%20Monsters%20--%20Rick%20Riordan%20--%20Percy%20Jackson%20and%20the%20Olympians%20%232%2C%202006%20--%20Galaxy%20--%209780786856862%20--%20cc8bdd3cf019c5267d33c9eb68ac56a2%20--%20Anna%E2%80%99s%20Archive.epub"
          fileSystem={useFileSystem}
          enableSwipe={true}
          enableSelection={true}
          onLongPress={() => {
            console.log("long pressed");
          }}
          onDoubleTap={() => {
            console.log("double tap");
          }}
          onSingleTap={() => {
            console.log("single tap");
          }}
          onSwipeDown={() => {
            SetSettingsVisible(true);
            console.log("swiped up");
          }}
        />
      </View>
      <ReaderSettings
        open={settingsVisible}
        changeFontSize={changeFontSize}
        changeTheme={changeTheme}
      />
    </SafeAreaView>
  );
}
