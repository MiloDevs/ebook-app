import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Reader, Themes, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@milodevs/expo-file-system";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Appearance,
  Animated,
  StatusBar,
  Keyboard,
} from "react-native";
import Iconify from "react-native-iconify/native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { COLORS } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReaderSettings } from "@/components/ui/readerSettings";
import { useAppContext } from "@/hooks/app-context";
import { Input } from "@/components/ui/input";

const FIXED_HEADER_HEIGHT = 80;
const FIXED_FOOTER_HEIGHT = 70;

// Define a type for a flattened chapter item
interface FlatChapter {
  href: string;
  label: string;
  isSubChapter: boolean;
  mainChapterLabel?: string;
}

// Function to flatten the nested TOC structure
const flattenToc = (toc: any[]): FlatChapter[] => {
  const flattened: FlatChapter[] = [];
  toc.forEach((item) => {
    // Add the main chapter
    flattened.push({
      href: item.href,
      label: item.label,
      isSubChapter: false,
    });

    // Add subchapters
    if (item.subitems && item.subitems.length > 0) {
      item.subitems.forEach((subitem: any) => {
        flattened.push({
          href: subitem.href,
          label: subitem.label,
          isSubChapter: true,
          mainChapterLabel: item.label,
        });
      });
    }
  });
  return flattened;
};

export default function ReaderPage() {
  const { fileUrl } = useLocalSearchParams<{ fileUrl: string }>();
  const {
    changeFontFamily,
    changeFontSize,
    changeTheme,
    theme,
    toc, // The original nested TOC data
    goToLocation,
    getLocations,
    locations,
    getCurrentLocation,
    currentLocation,
    totalLocations,
  } = useReader();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [locationsReady, setLocationsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { top, bottom } = useSafeAreaInsets();
  const { state } = useAppContext();
  const router = useRouter();

  const chaptersSheetRef = useRef<BottomSheet>(null);

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(0)).current;

  // New state for flattened TOC
  const [flattenedToc, setFlattenedToc] = useState<FlatChapter[]>([]);

  // Flatten TOC data when it loads
  useEffect(() => {
    if (toc.length > 0) {
      setFlattenedToc(flattenToc(toc));
    }
  }, [toc]);

  // Filter based on the flattened list
  const filteredChapters = flattenedToc.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const progress =
    currentLocation?.start?.location && totalLocations
      ? (currentLocation.start.location / totalLocations) * 100
      : 0;

  const toggleControls = useCallback(() => {
    const toValueHeader = showControls ? -100 : 0;
    const toValueFooter = showControls ? 100 : 0;

    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: toValueHeader,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(footerTranslateY, {
        toValue: toValueFooter,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowControls(!showControls);
    });
  }, [showControls, headerTranslateY, footerTranslateY]);

  const toggleChapters = useCallback(() => {
    if (showChapters) {
      chaptersSheetRef.current?.close();
      setSearchQuery("");
      Keyboard.dismiss();
    } else {
      chaptersSheetRef.current?.snapToIndex(0);
    }
    setShowChapters(!showChapters);
  }, [showChapters]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  useEffect(() => {
    const initializeReader = async () => {
      changeFontFamily("Helvetica");

      if (state?.settings) {
        const { readertheme } = state.settings;
        switch (readertheme) {
          case "dark":
            changeTheme(Themes.DARK);
            break;
          case "light":
            changeTheme(Themes.LIGHT);
            break;
          case "sepia":
            changeTheme(Themes.SEPIA);
            break;
          case "system":
            const colorScheme = Appearance.getColorScheme();
            changeTheme(colorScheme === "light" ? Themes.LIGHT : Themes.DARK);
            break;
          default:
            changeTheme(Themes.SEPIA);
        }
      }

      try {
        await getLocations();
        setLocationsReady(true);
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };

    initializeReader();
  }, [fileUrl, state?.settings, changeFontFamily, changeTheme, getLocations]);

  useEffect(() => {
    if (locations && !locationsReady) {
      setLocationsReady(true);
    }
  }, [locations, locationsReady]);

  useEffect(() => {
    if (locationsReady && !currentLocation) {
      getCurrentLocation();
    }
  }, [locationsReady, currentLocation, getCurrentLocation]);

  const handleChaptersSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setShowChapters(false);
      setSearchQuery("");
    }
  }, []);

  // Updated renderChapterItem using FlatChapter type
  const renderChapterItem = useCallback(
    ({ item }: { item: FlatChapter }) => {
      const { isSubChapter, mainChapterLabel } = item;
      const indentationClass = isSubChapter ? "ml-6" : "ml-0";
      const fontClass = isSubChapter ? "font-hepta_light" : "font-hepta_medium";
      const paddingClass = isSubChapter ? "py-3" : "py-4";

      return (
        <TouchableOpacity
          onPress={() => {
            goToLocation(item.href);
            toggleChapters();
          }}
          className={`${paddingClass} px-4 border-b border-gray_25 active:bg-gray-50 dark:active:bg-gray_25`}
          activeOpacity={0.7}
        >
          <View className={`flex-row items-start gap-2 ${indentationClass}`}>
            <Text
              style={{ color: theme.body.color }}
              className={`flex-1 text-small leading-6 ${fontClass}`}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.label.trim()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [goToLocation, toggleChapters, theme.body.color],
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.body.background,
        flex: 1,
      }}
    >
      <StatusBar
        barStyle={
          theme.body.background === "#000000" ? "light-content" : "dark-content"
        }
        backgroundColor={theme.body.background}
      />

      {/* Top Navigation Bar - Slides from top (Absolute position) */}
      <Animated.View
        style={{
          transform: [{ translateY: headerTranslateY }],
          paddingTop: top,
        }}
        className="absolute top-0 left-0 right-0 z-20"
      >
        <View
          style={{
            backgroundColor: theme.body.background + "F0",
          }}
          className="flex-row items-center justify-between px-4 py-3 backdrop-blur-lg"
        >
          <TouchableOpacity
            onPress={() => router.dismiss()}
            className="p-2 -ml-2 active:opacity-60"
            activeOpacity={0.6}
          >
            <Iconify
              icon="mingcute:left-line"
              size={24}
              color={theme.body.color}
            />
          </TouchableOpacity>

          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              className="p-2 active:opacity-60"
              activeOpacity={0.6}
            >
              <Iconify
                icon="mingcute:bookmark-line"
                size={22}
                color={theme.body.color}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleChapters}
              className="p-2 active:opacity-60"
              activeOpacity={0.6}
            >
              <Iconify
                icon="mingcute:list-check-fill"
                size={22}
                color={theme.body.color}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSettingsVisible(!settingsVisible)}
              className="p-2 active:opacity-60"
              activeOpacity={0.6}
            >
              <Iconify
                icon="mingcute:book-6-line"
                size={22}
                color={theme.body.color}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Reader Content (Container now uses FIXED padding to reserve space) */}
      <TouchableOpacity
        activeOpacity={1}
        style={{
          flex: 1,
          paddingTop: FIXED_HEADER_HEIGHT,
          paddingBottom: FIXED_FOOTER_HEIGHT,
          backgroundColor: theme.body.background,
        }}
        className="px-2"
      >
        <Reader
          initialLocation="2"
          src={fileUrl}
          fileSystem={useFileSystem}
          flow="paginated"
          allowScriptedContent={true}
          onSingleTap={toggleControls} // This is the most reliable event for control toggling
          onLocationChange={() => setShowControls(false)} // Keep this to hide controls on page turn
          onLongPress={toggleControls} // Keep this as a backup long-press handler
        />
      </TouchableOpacity>

      {/* Bottom Progress Bar - Slides from bottom (Absolute position) */}
      <Animated.View
        style={{
          transform: [{ translateY: footerTranslateY }],
          paddingBottom: bottom,
          display: showChapters ? "none" : "flex",
        }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <View
          style={{
            backgroundColor: theme.body.background + "F0",
          }}
          className="px-6 py-4 backdrop-blur-lg"
        >
          {/* Progress Bar */}
          <View className="mb-2">
            <View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                style={{
                  width: `${progress}%`,
                  backgroundColor: theme.body.color,
                }}
                className="h-full rounded-full"
              />
            </View>
          </View>

          {/* Location Info */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{ color: theme.body.color }}
              className="text-xs font-hepta_medium opacity-60"
            >
              {locationsReady && currentLocation?.start?.location
                ? `Location ${currentLocation.start.location}`
                : "Loading..."}
            </Text>
            <Text
              style={{ color: theme.body.color }}
              className="text-xs font-hepta_medium opacity-60"
            >
              {locationsReady && totalLocations
                ? `${Math.round(progress)}%`
                : ""}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Chapters Bottom Sheet */}
      <BottomSheet
        ref={chaptersSheetRef}
        index={-1}
        snapPoints={["50%", "75%"]}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        onChange={handleChaptersSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <View className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-gray_25">
            <Text
              style={{ color: theme.body.color }}
              className="font-hepta_semibold text-xl"
            >
              Chapters
            </Text>
            <Text
              style={{ color: theme.body.color }}
              className="font-hepta_medium text-sm opacity-60"
            >
              {filteredChapters.length}{" "}
              {filteredChapters.length === 1 ? "chapter" : "chapters"}
            </Text>
          </View>

          {/* Search Input */}
          <View className="mb-4">
            <Input
              isSearch={true}
              className="py-2.5 border-gray_25"
              placeholder="Search chapters...."
              onChangeText={setSearchQuery}
              value={searchQuery}
            />
          </View>

          {/* Chapters List */}
          {filteredChapters.length > 0 ? (
            <BottomSheetFlatList
              data={filteredChapters}
              renderItem={renderChapterItem}
              keyExtractor={(item, index) => `${item.href}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <Iconify
                icon="mingcute:search-2-line"
                size={48}
                color={theme.body.color}
                style={{ opacity: 0.3, marginBottom: 12 }}
              />
              <Text
                style={{ color: theme.body.color }}
                className="font-hepta_medium text-base opacity-60"
              >
                No chapters found
              </Text>
              <Text
                style={{ color: theme.body.color }}
                className="font-hepta_regular text-sm opacity-40 mt-1"
              >
                Try a different search term
              </Text>
            </View>
          )}
        </View>
      </BottomSheet>

      {/* Settings Panel */}
      <ReaderSettings
        open={settingsVisible}
        changeFontSize={changeFontSize}
        changeTheme={changeTheme}
      />
    </SafeAreaView>
  );
}
