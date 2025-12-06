// @/(tabs)/index.tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { SafeAreaView } from "react-native-safe-area-context";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { Input } from "@/components/ui/input";
import { BooksSection } from "@/components/ui/booksSection";
import { bookData } from "@/constants/bookData";
import { useEffect, useState, useRef } from "react";
import { pickEpubFiles } from "@/lib/bookLoader";
import { BookMetadata } from "@/types/books";
import { getAndCacheEpubMetadata } from "@/lib/epubParser";
import {
  getAllCachedBooks,
  validateAndUpdateCache,
} from "@/lib/bookMetadataCache";

export default function HomeScreen() {
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const { data: session } = authClient.useSession();
  const isProcessingRef = useRef(false);
  const processedPathsRef = useRef(new Set<string>());
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCachedBooksImmediately();
    }
  }, []);

  async function loadCachedBooksImmediately() {
    console.log("[CACHE] Starting immediate cache load...");
    const startTime = Date.now();

    try {
      const cachedBooks = await getAllCachedBooks();
      console.log(
        `[CACHE] Retrieved ${cachedBooks.length} books in ${Date.now() - startTime}ms`,
      );

      if (cachedBooks.length > 0) {
        const uniqueBooks = deduplicateBooks(cachedBooks);
        console.log(`[CACHE] Deduplicated to ${uniqueBooks.length} books`);
        setBooks(uniqueBooks);
        uniqueBooks.forEach((book) =>
          processedPathsRef.current.add(book.fileUrl),
        );
      }

      setTimeout(() => startBackgroundSync(), 0);
    } catch (error) {
      console.error("Error loading cached books:", error);
    }
  }

  async function startBackgroundSync() {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    console.log("[BACKGROUND] Starting background sync...");

    try {
      const cachedBooks = await getAllCachedBooks();

      setTimeout(() => validateBooksInBackground(cachedBooks), 0);

      console.log("[BACKGROUND] Starting file scan...");
      const scanStart = Date.now();
      const epubs = await pickEpubFiles();
      console.log(
        `[BACKGROUND] File scan completed in ${Date.now() - scanStart}ms. Found ${epubs.length} files`,
      );

      const cachedPaths = new Set(cachedBooks.map((book) => book.fileUrl));
      const newEpubs = epubs.filter(
        (path) =>
          !cachedPaths.has(path) && !processedPathsRef.current.has(path),
      );

      console.log(`[BACKGROUND] Found ${newEpubs.length} new books to process`);

      if (newEpubs.length > 0) {
        setProcessingCount(newEpubs.length);
        await processNewBooksInBackground(newEpubs);
      }
    } catch (error) {
      console.error("Error in background sync:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }

  async function validateBooksInBackground(cachedBooks: BookMetadata[]) {
    console.log("[VALIDATION] Starting book validation...");

    try {
      const validationPromises = cachedBooks.map((book) =>
        validateAndUpdateCache(book),
      );
      const validatedBooks = await Promise.all(validationPromises);
      const validBooks = validatedBooks.filter(
        (book): book is BookMetadata => book !== null,
      );

      console.log(
        `[VALIDATION] ${validBooks.length}/${cachedBooks.length} books are still valid`,
      );

      if (validBooks.length !== cachedBooks.length) {
        const uniqueValidBooks = deduplicateBooks(validBooks);
        setBooks(uniqueValidBooks);
        uniqueValidBooks.forEach((book) =>
          processedPathsRef.current.add(book.fileUrl),
        );
      }
    } catch (error) {
      console.error("Error validating books:", error);
    }
  }

  function deduplicateBooks(books: BookMetadata[]): BookMetadata[] {
    const seen = new Map<string, BookMetadata>();

    for (const book of books) {
      if (
        !seen.has(book.fileUrl) ||
        book.lastAccessed > (seen.get(book.fileUrl)?.lastAccessed || 0)
      ) {
        seen.set(book.fileUrl, book);
      }
    }

    return Array.from(seen.values());
  }

  async function processNewBooksInBackground(epubs: string[]) {
    const batchSize = 3;

    for (let i = 0; i < epubs.length; i += batchSize) {
      const batch = epubs.slice(i, i + batchSize);

      const batchPromises = batch.map(async (epubFilePath) => {
        if (processedPathsRef.current.has(epubFilePath)) {
          return null;
        }

        try {
          const book = await getAndCacheEpubMetadata(epubFilePath);
          if (book) {
            processedPathsRef.current.add(epubFilePath);
          }
          return book;
        } catch (error) {
          console.error(
            `Background processing failed for ${epubFilePath}:`,
            error,
          );
          return null;
        }
      });

      const results = await Promise.all(batchPromises);
      const validBooks = results.filter(
        (book): book is BookMetadata => book !== null,
      );

      if (validBooks.length > 0) {
        setBooks((prev) => {
          const combined = [...prev, ...validBooks];
          return deduplicateBooks(combined);
        });
      }

      setProcessingCount((prev) => Math.max(0, prev - batch.length));

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return (
    <SafeAreaView className="p-6 pb-0 bg-gray_0 flex-1">
      <View className="flex flex-row items-center mb-8 justify-between">
        <View>
          <Text className="font-hepta_regular text-h4">Hello there, </Text>
          <Text className="font-hepta_semibold text-h4">
            {session?.user.name}
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

      <Input
        isSearch={true}
        className="py-2.5 border-gray_25 mb-5"
        placeholder="Search books, authors, genres.."
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {books.length > 0 && (
          <View>
            <BooksSection title="My Library" books={books} />
            {processingCount > 0 && (
              <View style={styles.processingBanner}>
                <ActivityIndicator size="small" color={COLORS.gray_50} />
                <Text className="ml-2 text-gray_50 text-sm">
                  Processing {processingCount} new books...
                </Text>
              </View>
            )}
          </View>
        )}

        {loading && books.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gray_50} />
            <Text className="mt-4 text-gray_50">Loading your library...</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text className="text-gray_50">No books found</Text>
            <Text className="text-gray_400 text-sm mt-2">
              Add EPUB files to get started
            </Text>
          </View>
        ) : null}

        <BooksSection
          title="More of What You love"
          books={bookData.slice(0, 3)}
        />
        <BooksSection title="Trending Now" books={bookData.slice(3, 6)} />
        <BooksSection title="New on the Block" books={bookData.slice(6, 9)} />
      </ScrollView>
    </SafeAreaView>
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
