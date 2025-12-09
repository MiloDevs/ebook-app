// @/lib/bookLibraryService.ts
import { BookMetadata } from "@/types/books";
import { pickEpubFiles } from "./bookLoader";
import { getAllCachedBooks, validateAndUpdateCache } from "./bookMetadataCache";
import { getAndCacheEpubMetadata } from "./epubParser";

export interface BookLibraryState {
  books: BookMetadata[];
  processingCount: number;
}

export interface BookLibraryCallbacks {
  onBooksUpdate: (books: BookMetadata[]) => void;
  onProcessingCountUpdate: (count: number) => void;
}

export class BookLibraryService {
  private isProcessing = false;
  private processedPaths = new Set<string>();
  private hasLoadedInitially = false;

  private callbacks?: BookLibraryCallbacks;

  constructor(callbacks?: BookLibraryCallbacks) {
    this.callbacks = callbacks;
  }

  setCallbacks(callbacks: BookLibraryCallbacks) {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<BookMetadata[]> {
    if (this.hasLoadedInitially) {
      return await this.getAllBooks();
    }

    this.hasLoadedInitially = true;
    const books = await this.loadCachedBooksImmediately();

    // Start background sync without blocking
    setTimeout(() => this.startBackgroundSync(), 0);

    return books;
  }

  async getAllBooks(): Promise<BookMetadata[]> {
    try {
      const cachedBooks = await getAllCachedBooks();
      const uniqueBooks = this.deduplicateBooks(cachedBooks);
      return uniqueBooks;
    } catch (error) {
      console.error("Error getting all books:", error);
      return [];
    }
  }

  private async loadCachedBooksImmediately(): Promise<BookMetadata[]> {
    console.log("[CACHE] Starting immediate cache load...");
    const startTime = Date.now();

    try {
      const cachedBooks = await getAllCachedBooks();
      console.log(
        `[CACHE] Retrieved ${cachedBooks.length} books in ${Date.now() - startTime}ms`
      );

      if (cachedBooks.length > 0) {
        const uniqueBooks = this.deduplicateBooks(cachedBooks);
        console.log(`[CACHE] Deduplicated to ${uniqueBooks.length} books`);

        // Mark paths as processed
        uniqueBooks.forEach((book) => this.processedPaths.add(book.fileUrl));

        return uniqueBooks;
      }

      return [];
    } catch (error) {
      console.error("Error loading cached books:", error);
      return [];
    }
  }

  private async startBackgroundSync(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log("[BACKGROUND] Starting background sync...");

    try {
      const cachedBooks = await getAllCachedBooks();

      // Start validation in background without blocking
      setTimeout(() => this.validateBooksInBackground(cachedBooks), 0);

      console.log("[BACKGROUND] Starting file scan...");
      const scanStart = Date.now();
      const epubs = await pickEpubFiles();
      console.log(
        `[BACKGROUND] File scan completed in ${Date.now() - scanStart}ms. Found ${epubs.length} files`
      );

      const cachedPaths = new Set(cachedBooks.map((book) => book.fileUrl));
      const newEpubs = epubs.filter(
        (path: string) =>
          !cachedPaths.has(path) && !this.processedPaths.has(path)
      );

      console.log(`[BACKGROUND] Found ${newEpubs.length} new books to process`);

      if (newEpubs.length > 0) {
        this.callbacks?.onProcessingCountUpdate(newEpubs.length);
        await this.processNewBooksInBackground(newEpubs);
      }
    } catch (error) {
      console.error("Error in background sync:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async validateBooksInBackground(
    cachedBooks: BookMetadata[]
  ): Promise<void> {
    console.log("[VALIDATION] Starting book validation...");

    try {
      const validationPromises = cachedBooks.map((book) =>
        validateAndUpdateCache(book)
      );
      const validatedBooks = await Promise.all(validationPromises);
      const validBooks = validatedBooks.filter(
        (book): book is BookMetadata => book !== null
      );

      console.log(
        `[VALIDATION] ${validBooks.length}/${cachedBooks.length} books are still valid`
      );

      if (validBooks.length !== cachedBooks.length) {
        const uniqueValidBooks = this.deduplicateBooks(validBooks);
        this.callbacks?.onBooksUpdate(uniqueValidBooks);
        uniqueValidBooks.forEach((book) =>
          this.processedPaths.add(book.fileUrl)
        );
      }
    } catch (error) {
      console.error("Error validating books:", error);
    }
  }

  private deduplicateBooks(books: BookMetadata[]): BookMetadata[] {
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

  private async processNewBooksInBackground(epubs: string[]): Promise<void> {
    const batchSize = 3;

    for (let i = 0; i < epubs.length; i += batchSize) {
      const batch = epubs.slice(i, i + batchSize);

      const batchPromises = batch.map(async (epubFilePath) => {
        if (this.processedPaths.has(epubFilePath)) {
          return null;
        }

        try {
          const book = await getAndCacheEpubMetadata(epubFilePath);
          if (book) {
            this.processedPaths.add(epubFilePath);
          }
          return book;
        } catch (error) {
          console.error(
            `Background processing failed for ${epubFilePath}:`,
            error
          );
          return null;
        }
      });

      const results = await Promise.all(batchPromises);
      const validBooks = results.filter(
        (book): book is BookMetadata => book !== null
      );

      if (validBooks.length > 0) {
        // Get current books and add new ones
        const currentBooks = await this.getAllBooks();
        const combined = [...currentBooks, ...validBooks];
        const uniqueBooks = this.deduplicateBooks(combined);
        this.callbacks?.onBooksUpdate(uniqueBooks);
      }

      // Update processing count
      const currentProcessingCount = Math.max(
        0,
        epubs.length - (i + batchSize)
      );
      this.callbacks?.onProcessingCountUpdate(currentProcessingCount);

      // Small delay between batches to avoid blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Force refresh of the library
  async refresh(): Promise<BookMetadata[]> {
    this.processedPaths.clear();
    this.hasLoadedInitially = false;
    return await this.initialize();
  }

  // Get processing status
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  // Manual trigger for background sync
  async triggerBackgroundSync(): Promise<void> {
    if (!this.isProcessing) {
      await this.startBackgroundSync();
    }
  }
}

// Singleton instance for the app
export const bookLibraryService = new BookLibraryService();
