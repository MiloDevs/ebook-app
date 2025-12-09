import { hc } from "hono/client";
import type { AppType } from "../../backend/src/index";
import {
  Book,
  Author,
  Genre,
  Library,
  LibraryBook,
  BooksResponse,
  BookResponse,
  AuthorsResponse,
  AuthorResponse,
  GenresResponse,
  GenreResponse,
  SearchResponse,
  LibrariesResponse,
  LibraryResponse,
  CheckBookInLibraryResponse,
  SearchParams,
  CreateBookData,
  CreateAuthorData,
  CreateGenreData,
  CreateLibraryData,
  UpdateLibraryData,
  AddBookToLibraryData,
} from "@/types/api";

// Create the base hono client
const baseClient = hc<AppType>(
  process.env.EXPO_PUBLIC_API_URL || "http://100.83.233.106:3001/"
);

class ApiService {
  private client = baseClient;

  // Books API
  async getBooks(): Promise<Book[]> {
    try {
      const response = await this.client.book.$get();
      const data = (await response.json()) as BooksResponse;
      return data.books;
    } catch (error) {
      console.error("Failed to fetch books:", error);
      throw new Error("Failed to fetch books");
    }
  }

  async getBook(id: string): Promise<Book> {
    try {
      const response = await this.client.book[":id"].$get({ param: { id } });
      const data = (await response.json()) as BookResponse;
      return data.book;
    } catch (error) {
      console.error(`Failed to fetch book ${id}:`, error);
      throw new Error(`Failed to fetch book ${id}`);
    }
  }

  async createBook(bookData: CreateBookData): Promise<Book> {
    try {
      const response = await this.client.book.$post({ json: bookData });
      const data = (await response.json()) as BookResponse;
      return data.book;
    } catch (error) {
      console.error("Failed to create book:", error);
      throw new Error("Failed to create book");
    }
  }

  async updateBook(
    id: string,
    bookData: Partial<CreateBookData>
  ): Promise<Book> {
    // TODO: Fix this when book update endpoint is properly typed
    throw new Error("Book update not implemented yet");
  }

  async deleteBook(id: string): Promise<void> {
    try {
      await this.client.book[":id"].$delete({ param: { id } });
    } catch (error) {
      console.error(`Failed to delete book ${id}:`, error);
      throw new Error(`Failed to delete book ${id}`);
    }
  }

  // Authors API
  async getAuthors(): Promise<Author[]> {
    try {
      const response = await this.client.author.$get();
      const data = (await response.json()) as AuthorsResponse;
      return data.authors;
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      throw new Error("Failed to fetch authors");
    }
  }

  async getAuthor(id: string): Promise<Author> {
    try {
      const response = await this.client.author[":id"].$get({ param: { id } });
      const data = (await response.json()) as AuthorResponse;
      return data.author;
    } catch (error) {
      console.error(`Failed to fetch author ${id}:`, error);
      throw new Error(`Failed to fetch author ${id}`);
    }
  }

  async createAuthor(authorData: CreateAuthorData): Promise<Author> {
    try {
      const response = await this.client.author.$post({ json: authorData });
      const data = (await response.json()) as AuthorResponse;
      return data.author;
    } catch (error) {
      console.error("Failed to create author:", error);
      throw new Error("Failed to create author");
    }
  }

  // Genres API
  async getGenres(): Promise<Genre[]> {
    try {
      const response = await this.client.genre.$get();
      const data = (await response.json()) as GenresResponse;
      return data.genres;
    } catch (error) {
      console.error("Failed to fetch genres:", error);
      throw new Error("Failed to fetch genres");
    }
  }

  async getGenre(id: string): Promise<Genre> {
    try {
      const response = await this.client.genre[":id"].$get({ param: { id } });
      const data = (await response.json()) as GenreResponse;
      return data.genre;
    } catch (error) {
      console.error(`Failed to fetch genre ${id}:`, error);
      throw new Error(`Failed to fetch genre ${id}`);
    }
  }

  async createGenre(genreData: CreateGenreData): Promise<Genre> {
    try {
      const response = await this.client.genre.$post({ json: genreData });
      const data = (await response.json()) as GenreResponse;
      return data.genre;
    } catch (error) {
      console.error("Failed to create genre:", error);
      throw new Error("Failed to create genre");
    }
  }

  async createGenres(genresData: CreateGenreData[]): Promise<Genre[]> {
    try {
      const response = await this.client.genre.$post({ json: genresData });
      const data = (await response.json()) as GenresResponse;
      return data.genres;
    } catch (error) {
      console.error("Failed to create genres:", error);
      throw new Error("Failed to create genres");
    }
  }

  // Search API
  async search(params: SearchParams): Promise<SearchResponse> {
    try {
      const response = await this.client.search.$get({ query: params });
      const data = (await response.json()) as SearchResponse;
      return data;
    } catch (error) {
      console.error("Search failed:", error);
      throw new Error("Search failed");
    }
  }

  // Legacy method for backward compatibility
  async searchBooks(query: string): Promise<Book[]> {
    const response = await this.search({ q: query, full: "true" });
    return response.result;
  }

  async getRandomBooks(num: number = 10): Promise<Book[]> {
    try {
      const response = await this.client.search.random.$get({
        query: { num: num.toString() },
      });
      const data = (await response.json()) as SearchResponse;
      return data.result;
    } catch (error) {
      console.error("Failed to fetch random books:", error);
      throw new Error("Failed to fetch random books");
    }
  }

  // Convenience methods for common use cases
  async getBestSellingBooks(): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter((book) => book.best_selling);
  }

  async getRecommendedBooks(): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter((book) => book.recommended);
  }

  async getBooksByAuthor(authorId: string): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter((book) => book.author_id === authorId);
  }

  async getBooksByGenre(genreTitle: string): Promise<Book[]> {
    const response = await this.search({ genre: genreTitle, full: "true" });
    return response.result;
  }

  // Libraries API
  async getUserLibraries(userId: string): Promise<Library[]> {
    try {
      const response = await this.client.library[":userId"].$get({
        param: { userId },
      });
      const data = (await response.json()) as LibrariesResponse;
      return data.libraries;
    } catch (error) {
      console.error(`Failed to fetch libraries for user ${userId}:`, error);
      throw new Error(`Failed to fetch libraries for user ${userId}`);
    }
  }

  async getLibrary(userId: string, libraryId: string): Promise<Library> {
    try {
      const response = await this.client.library[":userId"][":libraryId"].$get({
        param: { userId, libraryId },
      });
      const data = (await response.json()) as unknown as LibraryResponse;
      return data.library;
    } catch (error) {
      console.error(`Failed to fetch library ${libraryId}:`, error);
      throw new Error(`Failed to fetch library ${libraryId}`);
    }
  }

  async createLibrary(
    userId: string,
    libraryData: CreateLibraryData
  ): Promise<Library> {
    try {
      const response = await this.client.library[":userId"].$post({
        param: { userId },
        json: libraryData,
      });
      const data = (await response.json()) as LibraryResponse;
      return data.library;
    } catch (error) {
      console.error("Failed to create library:", error);
      throw new Error("Failed to create library");
    }
  }

  async updateLibrary(
    userId: string,
    libraryId: string,
    libraryData: UpdateLibraryData
  ): Promise<Library> {
    try {
      const response = await this.client.library[":userId"][":libraryId"].$put({
        param: { userId, libraryId },
        json: libraryData,
      });
      const data = (await response.json()) as LibraryResponse;
      return data.library;
    } catch (error) {
      console.error(`Failed to update library ${libraryId}:`, error);
      throw new Error(`Failed to update library ${libraryId}`);
    }
  }

  async deleteLibrary(userId: string, libraryId: string): Promise<void> {
    try {
      await this.client.library[":userId"][":libraryId"].$delete({
        param: { userId, libraryId },
      });
    } catch (error) {
      console.error(`Failed to delete library ${libraryId}:`, error);
      throw new Error(`Failed to delete library ${libraryId}`);
    }
  }

  async addBookToLibrary(
    userId: string,
    libraryId: string,
    data: AddBookToLibraryData
  ): Promise<LibraryBook> {
    try {
      const response = await this.client.library[":userId"][
        ":libraryId"
      ].books.$post({
        param: { userId, libraryId },
        json: data,
      });
      const result = (await response.json()) as { libraryBook: LibraryBook };
      return result.libraryBook;
    } catch (error) {
      console.error(`Failed to add book to library ${libraryId}:`, error);
      throw new Error(`Failed to add book to library ${libraryId}`);
    }
  }

  async removeBookFromLibrary(
    userId: string,
    libraryId: string,
    bookId: string
  ): Promise<void> {
    try {
      await this.client.library[":userId"][":libraryId"].books[
        ":bookId"
      ].$delete({
        param: { userId, libraryId, bookId },
      });
    } catch (error) {
      console.error(
        `Failed to remove book ${bookId} from library ${libraryId}:`,
        error
      );
      throw new Error(
        `Failed to remove book ${bookId} from library ${libraryId}`
      );
    }
  }

  async isBookInLibrary(
    userId: string,
    libraryId: string,
    bookId: string
  ): Promise<boolean> {
    try {
      const response = await this.client.library[":userId"][":libraryId"].books[
        ":bookId"
      ].check.$get({
        param: { userId, libraryId, bookId },
      });
      const data = (await response.json()) as CheckBookInLibraryResponse;
      return data.isInLibrary;
    } catch (error) {
      console.error(
        `Failed to check if book ${bookId} is in library ${libraryId}:`,
        error
      );
      return false;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Also export the class for testing or custom instances
export { ApiService };

// Re-export the base client for advanced usage
export { baseClient as apiClient };
