import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Iconify from "react-native-iconify/native";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { COLORS } from "@/constants/colors";
import { Library } from "@/types/api";

export interface LibrarySwitcherRef {
  present: () => void;
  dismiss: () => void;
}

interface LibrarySwitcherProps {
  libraries: Library[];
  selectedLibrary: Library | null;
  onLibrarySelect: (library: Library) => void;
}

interface LibrarySwitcherTriggerProps {
  libraries: Library[];
  selectedLibrary: Library | null;
  onPress: () => void;
  isLoading?: boolean;
}

// Trigger Button Component
export function LibrarySwitcherTrigger({
  libraries,
  selectedLibrary,
  onPress,
  isLoading = false,
}: LibrarySwitcherTriggerProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray_25/30 rounded-xl mb-4">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color={COLORS.gray_50} />
          <Text className="ml-3 font-hepta_regular text-sm text-gray_50">
            Loading libraries...
          </Text>
        </View>
      </View>
    );
  }

  if (!libraries || libraries.length === 0) {
    return null;
  }

  // If only one library, don't show switcher
  if (libraries.length === 1) {
    return (
      <View className="px-4 py-3 bg-gray_25/30 rounded-xl mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-gray_25/50 items-center justify-center mr-3">
            <Iconify
              icon={
                libraries[0].is_default
                  ? "mingcute:bookmark-fill"
                  : "mingcute:folder-3-fill"
              }
              size={16}
              color={COLORS.gray_50}
            />
          </View>
          <View className="flex-1">
            <Text className="font-hepta_semibold text-base text-gray_100">
              {libraries[0].name}
            </Text>
            <Text className="font-hepta_regular text-xs text-gray_50">
              {libraries[0]._count?.books || 0} books
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Opening library switcher");
        onPress();
      }}
      className="flex-row items-center justify-between px-4 py-3 bg-gray_25/30 rounded-xl mb-4"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 rounded-lg bg-gray_25/50 items-center justify-center mr-3">
          <Iconify
            icon={
              selectedLibrary?.is_default
                ? "mingcute:bookmark-fill"
                : "mingcute:folder-3-fill"
            }
            size={16}
            color={COLORS.gray_50}
          />
        </View>
        <View className="flex-1">
          <Text className="font-hepta_semibold text-base text-gray_100">
            {selectedLibrary?.name || "Select Library"}
          </Text>
          <Text className="font-hepta_regular text-xs text-gray_50">
            {selectedLibrary?._count?.books || 0} books
          </Text>
        </View>
      </View>
      <Iconify icon="mingcute:down-line" size={20} color={COLORS.gray_50} />
    </TouchableOpacity>
  );
}

// BottomSheet Component
export const LibrarySwitcher = forwardRef<
  LibrarySwitcherRef,
  LibrarySwitcherProps
>(({ libraries, selectedLibrary, onLibrarySelect }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.snapToIndex(1),
    dismiss: () => bottomSheetRef.current?.close(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const handleLibrarySelect = useCallback(
    (library: Library) => {
      console.log("Library selected:", library.name);
      onLibrarySelect(library);
      bottomSheetRef.current?.close();
    },
    [onLibrarySelect]
  );

  const renderLibraryItem = useCallback(
    ({ item }: { item: Library }) => (
      <TouchableOpacity
        onPress={() => handleLibrarySelect(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray_25,
          backgroundColor: COLORS.gray_0,
          minHeight: 70,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View className="w-10 h-10 rounded-lg bg-gray_25/50 items-center justify-center mr-3">
            <Iconify
              icon={
                item.is_default
                  ? "mingcute:bookmark-fill"
                  : "mingcute:folder-3-fill"
              }
              size={18}
              color={COLORS.gray_50}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="font-hepta_medium text-base text-gray_100">
              {item.name}
            </Text>
            {item.description && (
              <Text
                className="font-hepta_regular text-sm text-gray_50 mt-1"
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
            <Text className="font-hepta_regular text-xs text-gray_50 mt-1">
              {item._count?.books || 0} books
            </Text>
          </View>
        </View>
        {selectedLibrary?.id === item.id && (
          <Iconify
            icon="mingcute:check-circle-fill"
            size={24}
            color={COLORS.accent}
          />
        )}
      </TouchableOpacity>
    ),
    [selectedLibrary, handleLibrarySelect]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: COLORS.gray_0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: COLORS.gray_25,
        width: 40,
        height: 4,
      }}
    >
      <View style={{ flex: 1, backgroundColor: COLORS.gray_0 }}>
        <View className="px-6 py-4 border-b border-gray_25">
          <Text className="font-hepta_semibold text-lg text-gray_100">
            Select Library
          </Text>
        </View>
        <BottomSheetFlatList
          data={libraries}
          renderItem={renderLibraryItem}
          keyExtractor={(item: Library) => item.id}
          contentContainerStyle={{
            paddingBottom: 20,
            backgroundColor: COLORS.gray_0,
          }}
          style={{ backgroundColor: COLORS.gray_0 }}
        />
      </View>
    </BottomSheet>
  );
});

LibrarySwitcher.displayName = "LibrarySwitcher";
