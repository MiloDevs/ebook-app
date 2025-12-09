import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { Input } from "@/components/ui/input";
import { ErrorBoundary, EmptyState } from "@/components/ui/error-boundary";
import {
  useBestSellingBooks,
  useRecommendedBooks,
  useRandomBooks,
} from "@/hooks/useApi";
import { Book } from "@/types/api";

// Helper function to convert API Book to display format
const convertApiBookToDisplayBook = (book: Book) => ({
  id: book.id,
  title: book.title,
  author: book.author?.full_name || "Unknown Author",
  imageUrl: book.image_url,
  fileUrl: book.file_url,
  description: book.description,
  bestSelling: book.best_selling,
  recommended: book.recommended,
  rating: book.rating,
  genres: book.genres || [],
  releasedAt: book.released_at,
  createdAt: book.created_at,
  updatedAt: book.updated_at,
});

export default function ViewAllBooksScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();

  // Fetch books based on section type
  const { data: bestSellingBooks, isLoading: loadingBestSelling } =
    useBestSellingBooks();
  const { data: recommendedBooks, isLoading: loadingRecommended } =
    useRecommendedBooks();
  const { data: randomBooks, isLoading: loadingRandom } = useRandomBooks(50); // Get more for "see more"

  const getSectionData = () => {
    switch (section) {
      case "recommended":
        return {
          title: "Recommended for You",
          books: recommendedBooks || [],
          isLoading: loadingRecommended,
          icon: "mingcute:star-fill",
        };
      case "bestsellers":
        return {
          title: "Best Sellers",
          books: bestSellingBooks || [],
          isLoading: loadingBestSelling,
          icon: "mingcute:trophy-line",
        };
      case "discover":
        return {
          title: "Discover New Books",
          books: randomBooks || [],
          isLoading: loadingRandom,
          icon: "mingcute:compass-line",
        };
      default:
        return {
          title: "Books",
          books: [],
          isLoading: false,
          icon: "mingcute:book-2-line",
        };
    }
  };

  const { title, books, isLoading, icon } = getSectionData();

  // Filter books based on search query
  const filteredBooks = books.filter((book) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author?.full_name.toLowerCase().includes(query) ||
      book.genres?.some((genre) => genre.title.toLowerCase().includes(query))
    );
  });

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      onPress={() => handleBookPress(item.id)}
      className="flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm"
    >
      {/* Book Cover */}
      <View className="mr-4">
        <Image
          source={{
            uri: item.image_url || undefined,
          }}
          placeholder={require("../assets/icons/book-placeholder.png")}
          contentFit="cover"
          style={{
            width: 60,
            height: 80,
            borderRadius: 8,
          }}
        />
      </View>

      {/* Book Details */}
      <View className="flex-1">
        <Text
          className="font-hepta_semibold text-base text-gray_100 mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="font-hepta_regular text-sm text-gray_75 mb-2">
          by {item.author?.full_name || "Unknown Author"}
        </Text>
        <View className="flex-row items-center mb-2">
          <Iconify icon="mingcute:star-fill" size={14} color="#FFD700" />
          <Text className="ml-1 font-hepta_medium text-sm text-gray_75">
            {item.rating.toFixed(1)}
          </Text>
          <Text className="ml-3 font-hepta_regular text-xs text-gray_50">
            {new Date(item.released_at).getFullYear()}
          </Text>
        </View>
        {/* Genres */}
        <View className="flex-row flex-wrap gap-1">
          {item.genres?.slice(0, 2).map((genre) => (
            <View
              key={genre.id}
              className="bg-gray_25/50 px-2 py-1 rounded-full"
            >
              <Text className="text-xs font-hepta_regular text-gray_75">
                {genre.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Arrow Icon */}
      <View className="ml-3">
        <Iconify icon="mingcute:right-line" size={20} color={COLORS.gray_25} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      {searchQuery ? (
        <>
          <Iconify
            icon="mingcute:search-2-line"
            size={48}
            color={COLORS.gray_25}
          />
          <Text className="font-hepta_medium text-lg text-gray_75 mt-4 mb-2">
            No books found
          </Text>
          <Text className="font-hepta_regular text-sm text-gray_50 text-center">
            Try adjusting your search terms
          </Text>
        </>
      ) : (
        <>
          <Iconify
            icon="mingcute:book-2-line"
            size={48}
            color={COLORS.gray_25}
          />
          <Text className="font-hepta_medium text-lg text-gray_75 mt-4 mb-2">
            No books available
          </Text>
          <Text className="font-hepta_regular text-sm text-gray_50 text-center">
            Check back later for new releases
          </Text>
        </>
      )}
    </View>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1 bg-gray_0">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-gray_25">
          <TouchableOpacity onPress={handleGoBack} className="mr-4">
            <Iconify
              icon="mingcute:left-line"
              size={24}
              color={COLORS.gray_75}
            />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center">
            <Iconify icon={icon} size={20} color={COLORS.primary} />
            <Text className="font-hepta_semibold text-lg text-gray_100 ml-2">
              {title}
            </Text>
          </View>
        </View>

        <View className="flex-1 px-6">
          {/* Search Input */}
          <View className="my-4">
            <Input
              isSearch={true}
              className="py-2.5 border-gray_25"
              placeholder="Search books..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Books Count */}
          {!isLoading && (
            <Text className="font-hepta_regular text-sm text-gray_50 mb-4">
              {filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "book" : "books"}
              {searchQuery && ` found for "${searchQuery}"`}
            </Text>
          )}

          {/* Books List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text className="font-hepta_regular text-sm text-gray_50 mt-4">
                Loading books...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredBooks}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={{
                paddingBottom: 20,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
