import React, {
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

import {
  useUserLibraries,
  useCreateLibrary,
  useAddBookToLibrary,
  useRemoveBookFromLibrary,
  useIsBookInLibrary,
} from "@/hooks/useLibraries";
import { Library } from "@/types/api";

import { Button } from "./button";

export interface LibrarySelectorRef {
  present: () => void;
  dismiss: () => void;
}

interface LibrarySelectorProps {
  bookId: string;
  bookTitle: string;
  userId: string;
}

export const LibrarySelector = forwardRef<
  LibrarySelectorRef,
  LibrarySelectorProps
>(({ bookId, bookTitle, userId }, ref) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState("");
  const [newLibraryDescription, setNewLibraryDescription] = useState("");
  const [toggleLoadingLibraryId, setToggleLoadingLibraryId] = useState<
    string | null
  >(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, boolean>
  >({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const { data: libraries = [], isLoading } = useUserLibraries(userId);
  const createLibrary = useCreateLibrary(userId);
  const addBookToLibrary = useAddBookToLibrary();
  const removeBookFromLibrary = useRemoveBookFromLibrary();
  const toast = useToast();

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        if (showCreateForm) {
          bottomSheetRef.current?.snapToIndex(1); // Expand to larger size
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        if (showCreateForm) {
          bottomSheetRef.current?.snapToIndex(0); // Return to normal size
        }
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [showCreateForm]);

  // Handle snap point changes when switching between modes
  useEffect(() => {
    if (showCreateForm) {
      // Expand to create form size
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [showCreateForm]);

  // Bottom Sheet setup
  const snapPoints = useMemo(
    () => (showCreateForm ? ["60%", "90%"] : ["35%", "60%"]),
    [showCreateForm]
  );
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.snapToIndex(0),
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

  const handleCreateLibrary = async () => {
    if (!newLibraryName.trim()) {
      toast.show("Library name is required", {
        type: "warning",
        placement: "top",
      });
      return;
    }

    try {
      await createLibrary.mutateAsync({
        name: newLibraryName.trim(),
        description: newLibraryDescription.trim() || undefined,
      });
      setNewLibraryName("");
      setNewLibraryDescription("");
      setShowCreateForm(false);
      toast.show("Library created successfully", {
        type: "success",
        placement: "top",
      });
    } catch {
      toast.show("Failed to create library", {
        type: "danger",
        placement: "top",
      });
    }
  };

  const handleLibraryToggle = async (
    library: Library,
    isInLibrary: boolean
  ) => {
    // Optimistic update - immediately show the expected state
    const optimisticKey = `${library.id}-${bookId}`;
    setOptimisticUpdates((prev) => ({
      ...prev,
      [optimisticKey]: !isInLibrary,
    }));

    setToggleLoadingLibraryId(library.id);
    try {
      if (isInLibrary) {
        await removeBookFromLibrary.mutateAsync({
          userId,
          libraryId: library.id,
          bookId,
        });
        toast.show("Book removed from library", {
          type: "success",
          placement: "top",
        });
      } else {
        await addBookToLibrary.mutateAsync({
          userId,
          libraryId: library.id,
          book_id: bookId,
        });
        toast.show("Book added to library", {
          type: "success",
          placement: "top",
        });
      }
    } catch {
      // Revert optimistic update on error
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[optimisticKey];
        return newUpdates;
      });

      toast.show("Failed to update library", {
        type: "danger",
        placement: "top",
      });
    } finally {
      setToggleLoadingLibraryId(null);
      // Clear optimistic update after request completes
      setTimeout(() => {
        setOptimisticUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[optimisticKey];
          return newUpdates;
        });
      }, 100);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: COLORS.gray_0 }}
      handleIndicatorStyle={{ backgroundColor: COLORS.gray_25 }}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView>
        {/* Header */}
        {!showCreateForm && (
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray_25">
            <Text className="font-hepta_semibold text-lg">Save to library</Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              className="p-2"
            >
              <Iconify
                icon="mingcute:close-line"
                size={24}
                color={COLORS.gray_50}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Book Info */}
        {!showCreateForm && (
          <View className="px-6 py-4 bg-gray_25/30">
            <Text
              className="font-hepta_medium text-base text-gray_75"
              numberOfLines={1}
            >
              {bookTitle}
            </Text>
          </View>
        )}

        {!showCreateForm && (
          <>
            {/* Libraries List */}
            <View className="px-6 py-4">
              {isLoading ? (
                <Text className="text-gray_50 text-center py-8">
                  Loading libraries...
                </Text>
              ) : (
                <>
                  {libraries.map((library) => (
                    <LibraryItem
                      key={library.id}
                      library={library}
                      bookId={bookId}
                      userId={userId}
                      onToggle={handleLibraryToggle}
                      isToggleLoading={toggleLoadingLibraryId === library.id}
                      optimisticUpdates={optimisticUpdates}
                    />
                  ))}
                </>
              )}

              {/* Create New Library Button */}
              <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                className="flex-row items-center py-4 border-t border-gray_25 mt-4"
              >
                <View className="w-10 h-10 rounded-full bg-gray_25 items-center justify-center mr-3">
                  <Iconify
                    icon="mingcute:new-folder-line"
                    size={20}
                    color={COLORS.gray_50}
                  />
                </View>
                <Text className="font-hepta_medium text-base text-gray_75">
                  Create new library
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Create Library Form */}
        {showCreateForm && (
          <View className="px-6 py-4 bg-gray_0">
            {/* Form Header */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setNewLibraryName("");
                  setNewLibraryDescription("");
                }}
                className="p-2 -ml-2"
              >
                <Iconify
                  icon="mingcute:left-line"
                  size={24}
                  color={COLORS.gray_50}
                />
              </TouchableOpacity>
              <Text className="font-hepta_semibold text-lg text-gray_100">
                Create new library
              </Text>
              <View className="w-10" />
            </View>

            <BottomSheetTextInput
              className="border border-gray_25 rounded-full px-4 pl-6 py-3 mb-4 font-hepta_regular"
              placeholder="Library name"
              placeholderTextColor={COLORS.gray_25}
              value={newLibraryName}
              onChangeText={setNewLibraryName}
              autoFocus
            />

            <BottomSheetTextInput
              className="border border-gray_25 rounded-full px-4 pl-6 py-3 mb-6 font-hepta_regular"
              placeholder="Description (optional)"
              value={newLibraryDescription}
              placeholderTextColor={COLORS.gray_25}
              onChangeText={setNewLibraryDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <Button
                variant="alt"
                onPress={() => {
                  setShowCreateForm(false);
                  setNewLibraryName("");
                  setNewLibraryDescription("");
                }}
                className="w-1/2"
              >
                <Text className="font-hepta_medium text-gray_50">Cancel</Text>
              </Button>

              <Button
                onPress={handleCreateLibrary}
                disabled={createLibrary.isPending || !newLibraryName.trim()}
                title="create"
                className="w-1/2"
                loading={createLibrary.isPending}
              ></Button>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

LibrarySelector.displayName = "LibrarySelector";

interface LibraryItemProps {
  library: Library;
  bookId: string;
  userId: string;
  onToggle: (library: Library, isInLibrary: boolean) => void;
  isToggleLoading: boolean;
  optimisticUpdates: Record<string, boolean>;
}

function LibraryItem({
  library,
  bookId,
  userId,
  onToggle,
  isToggleLoading,
  optimisticUpdates,
}: LibraryItemProps) {
  const { data: isInLibrary = false, isLoading } = useIsBookInLibrary(
    userId,
    library.id,
    bookId
  );

  // Use optimistic update if available, otherwise use actual data
  const optimisticKey = `${library.id}-${bookId}`;
  const displayIsInLibrary =
    optimisticKey in optimisticUpdates
      ? optimisticUpdates[optimisticKey]
      : isInLibrary;

  return (
    <TouchableOpacity
      onPress={() => onToggle(library, displayIsInLibrary)}
      disabled={isLoading || isToggleLoading}
      className="flex-row items-center py-3"
    >
      <View className="w-10 h-10 rounded-lg bg-gray_25/50 items-center justify-center mr-3">
        <Iconify
          icon={
            library.is_default
              ? "mingcute:bookmark-fill"
              : "mingcute:folder-3-fill"
          }
          size={20}
          color={COLORS.gray_50}
        />
      </View>

      <View className="flex-1">
        <Text className="font-hepta_medium text-base text-gray_100">
          {library.name}
        </Text>
        {library.description && (
          <Text className="font-hepta_regular text-sm text-gray_50 mt-1">
            {library.description}
          </Text>
        )}
        <Text className="font-hepta_regular text-xs text-gray_50 mt-1">
          {library._count?.books || 0} books
        </Text>
      </View>

      <View className="ml-3">
        {isLoading ? (
          <View className="w-6 h-6 rounded border-2 border-gray_25" />
        ) : isToggleLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Iconify
            icon={
              displayIsInLibrary
                ? "mingcute:check-circle-fill"
                : "mingcute:add-circle-line"
            }
            size={24}
            color={displayIsInLibrary ? COLORS.accent : COLORS.gray_25}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
