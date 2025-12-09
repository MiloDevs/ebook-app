import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { authClient } from "@/lib/auth-client";
import { useUserLibraries, useLibrary } from "@/hooks/useLibraries";
import {
  LibrarySwitcher,
  LibrarySwitcherTrigger,
  LibrarySwitcherRef,
} from "@/components/ui/LibrarySwitcher";
import { LibraryBooksList } from "@/components/ui/LibraryBooksList";
import { ErrorBoundary, EmptyState } from "@/components/ui/error-boundary";
import { Library } from "@/types/api";

export default function LibraryScreen() {
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const librarySwitcherRef = React.useRef<LibrarySwitcherRef>(null);
  const { data: session } = authClient.useSession();

  // Library hooks
  const {
    data: libraries = [],
    isLoading: loadingLibraries,
    error: librariesError,
  } = useUserLibraries(session?.user?.id || "");

  const {
    data: libraryWithBooks,
    isLoading: loadingLibraryBooks,
    refetch: refetchLibraryBooks,
  } = useLibrary(session?.user?.id || "", selectedLibrary?.id || "");

  // Auto-select first library if user has libraries
  React.useEffect(() => {
    if (libraries.length > 0 && !selectedLibrary) {
      setSelectedLibrary(libraries[0]);
    }
  }, [libraries, selectedLibrary]);

  const handleLibrarySelect = (library: Library) => {
    setSelectedLibrary(library);
  };

  // Show login prompt if not authenticated
  if (!session?.user) {
    return (
      <ErrorBoundary>
        <SafeAreaView className="flex-1 bg-gray_0">
          <EmptyState
            title="Sign in required"
            message="Please sign in to view your library"
            icon="mingcute:user-3-fill"
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  // Show error if failed to load libraries
  if (librariesError) {
    return (
      <ErrorBoundary>
        <SafeAreaView className="flex-1 bg-gray_0">
          <EmptyState
            title="Unable to load libraries"
            message="Please check your internet connection and try again"
            icon="mingcute:wifi-off-fill"
            onRetry={() => window.location.reload()}
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  // Show loading state
  if (loadingLibraries) {
    return (
      <SafeAreaView className="flex-1 bg-gray_0">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="font-hepta_regular text-sm text-gray_50 mt-4">
            Loading your libraries...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no libraries
  if (libraries.length === 0) {
    return (
      <ErrorBoundary>
        <SafeAreaView className="flex-1 bg-gray_0">
          <EmptyState
            title="No libraries yet"
            message="Start building your library by adding books from the home page"
            icon="mingcute:bookmark-line"
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1 bg-gray_0 px-4 pb-0">
        {/* Header */}
        <View className="flex flex-row items-center mb-8 justify-between">
          <View>
            <Text className="font-hepta_regular text-h4">Your Library</Text>
            <Text className="font-hepta_semibold text-h4">
              {libraries.length}{" "}
              {libraries.length === 1 ? "library" : "libraries"}
            </Text>
          </View>
          <View className="p-4 rounded-full bg-gray_25">
            <Iconify
              icon="mingcute:bookmark-fill"
              size={24}
              color={COLORS.gray_50}
            />
          </View>
        </View>

        {/* Library Switcher Trigger */}
        <LibrarySwitcherTrigger
          libraries={libraries}
          selectedLibrary={selectedLibrary}
          onPress={() => librarySwitcherRef.current?.present()}
          isLoading={loadingLibraries}
        />

        {/* Library Management */}
        <View className="flex-1">
          {selectedLibrary && (
            <LibraryBooksList
              userId={session.user.id}
              libraryId={selectedLibrary.id}
              books={libraryWithBooks?.books || []}
              isLoading={loadingLibraryBooks}
              onRefresh={refetchLibraryBooks}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Library Switcher BottomSheet */}
      <LibrarySwitcher
        ref={librarySwitcherRef}
        libraries={libraries}
        selectedLibrary={selectedLibrary}
        onLibrarySelect={handleLibrarySelect}
      />
    </ErrorBoundary>
  );
}
