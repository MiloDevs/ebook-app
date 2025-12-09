import { BooksSection } from "@/components/ui/booksSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/constants/colors";

import { useRandomBooks, useSearchWithPagination } from "@/hooks/useApi";
import { Book } from "@/types/api";
import { ErrorBoundary, EmptyState } from "@/components/ui/error-boundary";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import Iconify from "react-native-iconify/native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState<Book[]>([]);
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();

  // Set search query from URL parameters on mount
  useEffect(() => {
    if (q && typeof q === "string") {
      setSearchQuery(q);
      // Reset pagination when search query changes
      setPage(1);
      setAllResults([]);
    }
  }, [q]);

  // Reset pagination when search query changes
  useEffect(() => {
    setPage(1);
    setAllResults([]);
  }, [searchQuery]);

  // Use the API hooks
  const {
    data: randomBooks,
    isLoading: loadingRandom,
    error: errorRandom,
    refetch: refetchRandom,
  } = useRandomBooks(3);

  // Use paginated search for better performance
  const searchResultsPaginated = useSearchWithPagination(
    { q: searchQuery, full: "true", page, limit: 10 },
    searchQuery.trim().length > 0
  );

  // Update accumulated results when new data comes in
  useEffect(() => {
    if (searchResultsPaginated.data?.result) {
      if (page === 1) {
        // First page - replace all results
        setAllResults(searchResultsPaginated.data.result);
      } else {
        // Subsequent pages - append to existing results
        setAllResults((prev) => [
          ...prev,
          ...searchResultsPaginated.data!.result.filter(
            (book) => !prev.some((existing) => existing.id === book.id)
          ),
        ]);
      }
    }
  }, [searchResultsPaginated.data, page]);

  const { refetch: refetchSingle } = useRandomBooks(1);

  const handleRefresh = () => {
    refetchRandom();
  };

  const loadMore = () => {
    if (
      searchResultsPaginated.data?.pagination?.hasNextPage &&
      !searchResultsPaginated.isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  };

  // Footer component for loading indicator
  const renderFooter = () => {
    if (searchResultsPaginated.isFetching && page > 1) {
      return (
        <View className="py-4 items-center justify-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="text-gray_50 mt-2 font-hepta_regular text-sm">
            Loading more results...
          </Text>
        </View>
      );
    }
    return null;
  };

  // Header component for search results info
  const renderHeader = () => (
    <View className="mb-6">
      <Text className="font-hepta_medium text-sm text-gray_50">
        Search Results for &ldquo;{searchQuery}&rdquo;
      </Text>
      <Text className="font-hepta_medium text-sm text-gray_50 mt-2">
        {searchResultsPaginated.data?.pagination?.total || allResults.length}{" "}
        book
        {(searchResultsPaginated.data?.pagination?.total ||
          allResults.length) !== 1
          ? "s"
          : ""}{" "}
        found
      </Text>
    </View>
  );

  const surpriseMe = async () => {
    setLoading(true);
    try {
      const { data } = await refetchSingle();
      if (data && data.length > 0 && data[0]?.file_url) {
        router.push(`/reader?fileUrl=${encodeURIComponent(data[0].file_url)}`);
      }
    } catch (error) {
      console.error("Surprise me error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex bg-gray_0 flex-1 p-6">
        <View className="flex flex-row items-center mb-8 justify-between">
          <View>
            <Text className="font-hepta_regular text-h4">Search</Text>
          </View>
          <View className="p-4 rounded-full bg-gray_25">
            <Iconify
              icon="mingcute:user-3-fill"
              size={24}
              color={COLORS.gray_50}
            />
          </View>
        </View>

        <Input
          isSearch={true}
          className="py-2.5 border-gray_25 mb-5"
          placeholder="Search books, authors, genres.."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
        />

        {/* Default State - No Search Query */}
        {!searchQuery.trim() && (
          <View className="flex-1 justify-center items-center">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              refreshControl={
                <RefreshControl
                  refreshing={loadingRandom}
                  onRefresh={handleRefresh}
                />
              }
            >
              <View className="items-center gap-4">
                <View className="items-center">
                  <Text className="font-hepta_semibold text-h4 mb-2 text-center">
                    Don&apos;t know what to read?
                  </Text>
                  <Text className="font-hepta_regular text-p mb-6 text-center">
                    Try one of these suggestions
                  </Text>
                </View>

                {errorRandom ? (
                  <EmptyState
                    title="Unable to load suggestions"
                    message="Please check your internet connection and try again"
                    icon="mingcute:alert-octagon-fill"
                    onRetry={refetchRandom}
                  />
                ) : loadingRandom ? (
                  <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text className="text-gray_50 mt-4 font-hepta_regular">
                      Loading book suggestions...
                    </Text>
                  </View>
                ) : randomBooks && randomBooks.length > 0 ? (
                  <View className="flex-1 items-center">
                    <BooksSection
                      books={randomBooks.map(convertApiBookToDisplayBook)}
                    />
                  </View>
                ) : (
                  <EmptyState
                    title="No book suggestions available"
                    message="Check back later for new books"
                    icon="mingcute:book-2-fill"
                    onRetry={refetchRandom}
                  />
                )}

                <Button
                  title={loading ? "Finding a book" : "Surprise Me"}
                  prefixIcon="streamline:dice-5-remix"
                  className="w-full mt-6"
                  variant={"outline"}
                  loading={loading}
                  onPress={surpriseMe}
                />
              </View>
            </ScrollView>
          </View>
        )}

        {/* Search Results State - Has Search Query */}
        {searchQuery.trim() && (
          <View className="flex-1">
            {searchResultsPaginated.error ? (
              <EmptyState
                title="Search failed"
                message="Please check your internet connection and try again"
                icon="mingcute:alert-octagon-fill"
                onRetry={() => searchResultsPaginated.refetch()}
              />
            ) : searchResultsPaginated.isLoading && page === 1 ? (
              <View className="items-center justify-center flex-1">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-gray_50 mt-4 font-hepta_regular">
                  Searching for books...
                </Text>
              </View>
            ) : allResults && allResults.length > 0 ? (
              <BooksSection
                books={allResults.map(convertApiBookToDisplayBook)}
                infiniteScroll={true}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                refreshControl={
                  <RefreshControl
                    refreshing={searchResultsPaginated.isLoading && page === 1}
                    onRefresh={() => {
                      setPage(1);
                      setAllResults([]);
                      searchResultsPaginated.refetch();
                    }}
                  />
                }
              />
            ) : (
              <EmptyState
                title="No results found"
                message={`We couldn't find any books matching "${searchQuery}". Try different keywords or check your spelling.`}
                icon="mingcute:search-line"
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}
