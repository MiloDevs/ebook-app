// @/lib/bookMetadataCache.ts
import * as FileSystem from "expo-file-system";
import { ParsedBookMetadata } from "./epubParser";
import { BookMetadata } from "@/types/books";
import { db } from "./db";

const COVER_CACHE_DIR = `${FileSystem.Paths.document.uri}book_covers/`;
const ALL_BOOKS_CACHE_KEY = "all_books_cache";

async function ensureCacheDir() {
  const dir = new FileSystem.Directory(COVER_CACHE_DIR);
  const dirInfo = dir.info();
  if (!dirInfo.exists) {
    dir.create();
  }
}

const normalizeFilePath = (filePath: string): string => {
  if (filePath.startsWith("file://")) {
    return filePath;
  }
  return `file://${encodeURI(filePath)}`;
};

export async function getAllCachedBooks(): Promise<BookMetadata[]> {
  const startTime = Date.now();

  try {
    console.log("[DB] Fetching all books cache...");
    const booksCache =
      (await db.get<Record<string, BookMetadata>>(ALL_BOOKS_CACHE_KEY)) || {};
    const books = Object.values(booksCache);
    console.log(
      `[DB] Got ${books.length} books in ${Date.now() - startTime}ms`,
    );

    return books;
  } catch (error) {
    console.error("Error getting all cached books:", error);
    return [];
  }
}

export async function getCachedMetadata(
  filePath: string,
): Promise<BookMetadata | null> {
  try {
    const booksCache =
      (await db.get<Record<string, BookMetadata>>(ALL_BOOKS_CACHE_KEY)) || {};
    const cached = booksCache[filePath];

    if (!cached) return null;

    try {
      const normalizedPath = normalizeFilePath(filePath);
      // @ts-ignore
      const fileInfo = new FileSystem.File(normalizedPath).info();

      if (!fileInfo.exists) {
        delete booksCache[filePath];
        await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
        if (cached.localCoverUri) {
          try {
            new FileSystem.File(cached.localCoverUri).delete();
          } catch (e) {}
        }
        return null;
      }

      if (
        fileInfo.size !== cached.fileSize ||
        fileInfo.modificationTime !== cached.lastModified
      ) {
        delete booksCache[filePath];
        await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
        if (cached.localCoverUri) {
          try {
            new FileSystem.File(cached.localCoverUri).delete();
          } catch (e) {}
        }
        return null;
      }

      cached.lastAccessed = Date.now();
      booksCache[filePath] = cached;
      await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
      return cached;
    } catch (fileError) {
      console.error(`File validation error for ${filePath}:`, fileError);
      return cached;
    }
  } catch (error) {
    console.error("Error getting cached metadata:", error);
    return null;
  }
}

export async function validateAndUpdateCache(
  book: BookMetadata,
): Promise<BookMetadata | null> {
  try {
    const normalizedPath = normalizeFilePath(book.fileUrl);
    // @ts-ignore
    const fileInfo = new FileSystem.File(normalizedPath).info();

    const booksCache =
      (await db.get<Record<string, BookMetadata>>(ALL_BOOKS_CACHE_KEY)) || {};

    if (!fileInfo.exists) {
      delete booksCache[book.fileUrl];
      await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
      if (book.localCoverUri) {
        try {
          new FileSystem.File(book.localCoverUri).delete();
        } catch (e) {}
      }
      return null;
    }

    if (
      fileInfo.size !== book.fileSize ||
      fileInfo.modificationTime !== book.lastModified
    ) {
      delete booksCache[book.fileUrl];
      await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
      if (book.localCoverUri) {
        try {
          new FileSystem.File(book.localCoverUri).delete();
        } catch (e) {}
      }
      return null;
    }

    book.lastAccessed = Date.now();
    booksCache[book.fileUrl] = book;
    await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
    return book;
  } catch (error) {
    console.error("Error validating cache:", error);
    return book;
  }
}

export async function cacheMetadataAndCover(
  metadata: ParsedBookMetadata,
): Promise<BookMetadata> {
  await ensureCacheDir();
  let localCoverUri: string | null = null;

  if (metadata.imageUrl) {
    try {
      const fileName = `${metadata.fileUrl.replace(/[:\/.]/g, "_")}.jpg`;
      const coverUri = COVER_CACHE_DIR + fileName;
      const base64Data = metadata.imageUrl.split(",")[1];

      new FileSystem.File(coverUri).write(base64Data, {
        encoding: "base64",
      });
      localCoverUri = coverUri;
    } catch (error) {
      console.error("Error saving cover image:", error);
    }
  }

  const finalMetadata: BookMetadata = {
    title: metadata.title,
    author: metadata.author,
    tableOfContents: metadata.tableOfContents,
    imageUrl: localCoverUri,
    fileUrl: metadata.fileUrl,
    fileSize: metadata.fileSize,
    lastModified: metadata.lastModified,
    lastAccessed: Date.now(),
  };

  const booksCache =
    (await db.get<Record<string, BookMetadata>>(ALL_BOOKS_CACHE_KEY)) || {};
  booksCache[metadata.fileUrl] = finalMetadata;
  await db.set(ALL_BOOKS_CACHE_KEY, booksCache);

  return finalMetadata;
}

export async function removeCachedBook(filePath: string): Promise<void> {
  try {
    const booksCache =
      (await db.get<Record<string, BookMetadata>>(ALL_BOOKS_CACHE_KEY)) || {};
    const book = booksCache[filePath];

    if (book?.localCoverUri) {
      try {
        new FileSystem.File(book.localCoverUri).delete();
      } catch (e) {}
    }

    delete booksCache[filePath];
    await db.set(ALL_BOOKS_CACHE_KEY, booksCache);
  } catch (error) {
    console.error("Error removing cached book:", error);
  }
}
