// @/(tabs)/index.tsx
import { BooksSection } from "@/components/ui/booksSection";
import { Input } from "@/components/ui/input";
import { SearchSuggestions } from "@/components/ui/SearchSuggestions";
import { COLORS } from "@/constants/colors";
import { authClient } from "@/lib/auth-client";
import {
  useBestSellingBooks,
  useRecommendedBooks,
  useRandomBooks,
  useSearchSuggestions,
} from "@/hooks/useApi";
import { useUserLibraries, useLibrary } from "@/hooks/useLibraries";
import { Book } from "@/types/api";
import { ErrorBoundary, EmptyState } from "@/components/ui/error-boundary";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
} from "react-native";
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

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInteractingWithSuggestions, setIsInteractingWithSuggestions] =
    useState(false);

  // Get search suggestions for the home page
  const { data: suggestions = [], isLoading: loadingSuggestions } =
    useSearchSuggestions(searchQuery);

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Only hide suggestions if not actively interacting with them
    if (!isInteractingWithSuggestions) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 100);
    }
  };

  const handleSuggestionsInteraction = () => {
    console.log("Suggestions interaction started");
    setIsInteractingWithSuggestions(true);
  };

  const handleSuggestionPress = (book: Book) => {
    console.log("Suggestion pressed:", book.title, book.id);

    // Dismiss keyboard first
    Keyboard.dismiss();

    // Reset interaction state and hide suggestions
    setIsInteractingWithSuggestions(false);
    setShowSuggestions(false);
    setSearchQuery("");

    // Navigate immediately
    console.log("Navigating to book:", book.id);
    router.push(`/book/${book.id}`);
  };

  const handleSeeAllPress = () => {
    Keyboard.dismiss();
    setIsInteractingWithSuggestions(false);
    setShowSuggestions(false);
    router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSubmitEditing = () => {
    if (searchQuery.trim()) {
      Keyboard.dismiss();
      setIsInteractingWithSuggestions(false);
      setShowSuggestions(false);
      router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Reset interaction state when search query changes or component unmounts
  useEffect(() => {
    setIsInteractingWithSuggestions(false);
  }, [searchQuery]);

  // Library hooks - get latest updated library for "From Your Library" section
  const { data: libraries = [] } = useUserLibraries(session?.user?.id || "");
  const latestLibrary = libraries.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];

  const { data: latestLibraryWithBooks } = useLibrary(
    session?.user?.id || "",
    latestLibrary?.id || ""
  );

  // Fetch different types of books from API
  const {
    data: bestSellingBooks,
    isLoading: loadingBestSelling,
    error: errorBestSelling,
    refetch: refetchBestSelling,
  } = useBestSellingBooks();

  const {
    data: recommendedBooks,
    isLoading: loadingRecommended,
    error: errorRecommended,
    refetch: refetchRecommended,
  } = useRecommendedBooks();

  const {
    data: randomBooks,
    isLoading: loadingRandom,
    error: errorRandom,
    refetch: refetchRandom,
  } = useRandomBooks(6);

  const isLoading = loadingBestSelling || loadingRecommended || loadingRandom;
  const hasError = errorBestSelling || errorRecommended || errorRandom;

  const handleRetry = () => {
    if (errorBestSelling) refetchBestSelling();
    if (errorRecommended) refetchRecommended();
    if (errorRandom) refetchRandom();
  };

  return (
    <ErrorBoundary>
      <SafeAreaView className="px-6 bg-gray_0 flex-1">
        <View className="flex flex-row items-center mb-8 justify-between">
          <View>
            <Text className="font-hepta_regular text-h4">Hello there, </Text>
            <Text className="font-hepta_semibold text-h4">
              {session?.user.name || "Reader"}
            </Text>
          </View>
          <View className="p-4 rounded-full bg-gray_25">
            <Iconify
              icon="mingcute:user-3-fill"
              size={24}
              color={COLORS.gray_50}
            />
          </View>
        </View>

        <View className="relative mb-5" style={{ zIndex: 1 }}>
          <Input
            isSearch={true}
            className="py-2.5 border-gray_25"
            placeholder="Search books, authors, genres.."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="search"
          />

          <SearchSuggestions
            suggestions={suggestions}
            isLoading={loadingSuggestions}
            query={searchQuery}
            onSuggestionPress={handleSuggestionPress}
            onSeeAllPress={handleSeeAllPress}
            onTouchStart={handleSuggestionsInteraction}
            visible={showSuggestions && searchQuery.length >= 2}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {hasError ? (
            <EmptyState
              title="Unable to load books"
              message="Please check your internet connection and try again"
              icon="mingcute:wifi-off-fill"
              onRetry={handleRetry}
            />
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gray_50} />
              <Text className="text-gray_50 mt-4">Loading books...</Text>
            </View>
          ) : (
            <>
              {/* From Your Library Section */}
              {latestLibraryWithBooks?.books &&
                latestLibraryWithBooks.books.length > 0 && (
                  <BooksSection
                    title={`From "${latestLibrary?.name || "Your Library"}"`}
                    books={latestLibraryWithBooks.books
                      .slice(0, 3)
                      .map((libraryBook) =>
                        convertApiBookToDisplayBook(libraryBook.book!)
                      )
                      .filter(Boolean)}
                    sectionType="library"
                  />
                )}

              {recommendedBooks && recommendedBooks.length > 0 && (
                <BooksSection
                  title="Recommended for You"
                  books={recommendedBooks
                    .slice(0, 3)
                    .map(convertApiBookToDisplayBook)}
                  sectionType="recommended"
                />
              )}

              {bestSellingBooks && bestSellingBooks.length > 0 && (
                <BooksSection
                  title="Best Sellers"
                  books={bestSellingBooks
                    .slice(0, 3)
                    .map(convertApiBookToDisplayBook)}
                  sectionType="bestsellers"
                />
              )}

              {randomBooks && randomBooks.length > 0 && (
                <BooksSection
                  title="Discover New Books"
                  books={randomBooks
                    .map(convertApiBookToDisplayBook)
                    .slice(0, 3)}
                  sectionType="discover"
                />
              )}

              {(!recommendedBooks || recommendedBooks.length === 0) &&
                (!bestSellingBooks || bestSellingBooks.length === 0) &&
                (!randomBooks || randomBooks.length === 0) && (
                  <EmptyState
                    title="No books available"
                    message="Check back later for new releases"
                    icon="mingcute:book-2-fill"
                  />
                )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  processingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
});
