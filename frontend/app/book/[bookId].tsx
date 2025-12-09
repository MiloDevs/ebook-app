import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useBook } from "@/hooks/useApi";
import { COLORS } from "@/constants/colors";
import { ErrorBoundary, EmptyState } from "@/components/ui/error-boundary";
import Iconify from "react-native-iconify/native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";
import { ScrollView } from "react-native-gesture-handler";
import {
  LibrarySelector,
  LibrarySelectorRef,
} from "@/components/ui/LibrarySelector";
import { authClient } from "@/lib/auth-client";

const { height } = Dimensions.get("screen");

export default function BookDetailsScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const libraryBottomSheetRef = useRef<LibrarySelectorRef>(null);

  const { data: session } = authClient.useSession();
  const { data: book, isLoading, error, refetch } = useBook(bookId || "");

  const handleReadBook = () => {
    if (book?.file_url) {
      router.push(`/reader?fileUrl=${encodeURIComponent(book.file_url)}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAddToLibrary = () => {
    libraryBottomSheetRef.current?.present();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray_0">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray_50 mt-4">Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <ErrorBoundary>
        <SafeAreaView className="flex-1 bg-gray_0">
          <EmptyState
            title="Book not found"
            message="Unable to load book details. Please try again."
            icon="mingcute:book-6-fill"
            onRetry={refetch}
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView className="flex-1 flex-col">
        {/* Full Screen Background Image */}
        <View
          className="w-full rounded-b-xl overflow-hidden"
          style={{
            height: height * 0.4,
          }}
        >
          <Image
            source={{
              uri: book.image_url || undefined,
            }}
            placeholder={require("../../assets/icons/book-placeholder.png")}
            contentFit="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.1)"]}
            className="absolute top-0 left-0 right-0 bottom-0"
          />
        </View>

        {/* Header with back button and user avatar */}
        <SafeAreaView className="flex-row justify-between absolute items-center px-5 pt-2.5 z-10">
          <TouchableOpacity onPress={handleGoBack} className="p-2">
            <Iconify icon="mingcute:left-line" size={28} color="white" />
          </TouchableOpacity>
          {/* <View className="w-10 h-10 rounded-full bg-white/30 justify-center items-center">
            <Iconify
              icon="mingcute:user-3-fill"
              size={24}
              color={COLORS.gray_50}
            />
          </View> */}
        </SafeAreaView>

        {/* Content Container */}
        <View className="flex-1 mt-6 px-4 pt-8">
          {/* Badges Row */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {book.best_selling && (
              <View className="bg-accent px-3 py-1.5 rounded-full">
                <Text className="text-small font-hepta_semibold text-white">
                  Best Seller
                </Text>
              </View>
            )}
            {book.recommended && (
              <View className="bg-primary px-3 py-1.5 rounded-full">
                <Text className="text-xs font-hepta_semibold text-white">
                  Recommended
                </Text>
              </View>
            )}
          </View>

          {/* Book Title */}
          <Text className="font-hepta_bold text-h3 text-gray_100 mb-2">
            {book.title}
          </Text>

          {/* Author */}
          <Text className="font-hepta_regular text-lg text-gray_75 mb-4">
            by {book.author?.full_name || "Unknown Author"}
          </Text>

          {/* Rating and Release Date */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center mr-6">
              <Iconify icon="mingcute:star-fill" size={18} color="#FFD700" />
              <Text className="ml-2 font-hepta_semibold text-base text-gray_100">
                {book.rating.toFixed(1)}
              </Text>
              <Text className="ml-1 font-hepta_regular text-sm text-gray_50">
                /5.0
              </Text>
            </View>
            <View className="flex-row items-center">
              <Iconify
                icon="mingcute:calendar-2-fill"
                size={16}
                color={COLORS.gray_50}
              />
              <Text className="ml-2 font-hepta_regular text-sm text-gray_50">
                {new Date(book.released_at).getFullYear()}
              </Text>
            </View>
          </View>

          {/* Genres */}
          {book.genres && book.genres.length > 0 && (
            <View className="mb-6">
              <Text className="font-hepta_semibold text-base text-gray_100 mb-3">
                Genres
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <View
                    key={genre.id}
                    className="bg-gray_25 px-3 py-2 rounded-full"
                  >
                    <Text className="text-sm font-hepta_medium text-gray_75">
                      {genre.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-1 mb-6">
            <Button
              onPress={handleReadBook}
              className="flex-1 flex-row rounded-r-none items-center"
            >
              <Iconify icon="mingcute:book-2-fill" color="white" />
              <Text className="font-hepta_semibold text-white">
                Start Reading
              </Text>
            </Button>
            <Button onPress={handleAddToLibrary} className="rounded-l-none">
              <Iconify
                icon="mingcute:add-circle-line"
                size={24}
                color={COLORS.gray_0}
              />
            </Button>
          </View>

          {/* Overview Section */}
          <View className="mb-8">
            <Text className="font-hepta_semibold text-lg text-gray_100 mb-3">
              About this book
            </Text>
            <Text className="font-hepta_regular text-base text-gray_75 leading-6">
              {book.description}
            </Text>
          </View>
        </View>

        {/* Library Selector Bottom Sheet */}
      </ScrollView>
      {session?.user && (
        <LibrarySelector
          ref={libraryBottomSheetRef}
          bookId={bookId || ""}
          bookTitle={book.title}
          userId={session.user.id}
        />
      )}
    </ErrorBoundary>
  );
}
