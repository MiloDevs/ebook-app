import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import type {
  SearchParams,
  CreateBookData,
  CreateAuthorData,
  CreateGenreData,
} from "@/types/api";

// Query Keys
export const queryKeys = {
  books: ["books"] as const,
  book: (id: string) => ["books", id] as const,
  authors: ["authors"] as const,
  author: (id: string) => ["authors", id] as const,
  genres: ["genres"] as const,
  genre: (id: string) => ["genres", id] as const,
  search: (params: SearchParams) => ["search", params] as const,
  randomBooks: (num: number) => ["randomBooks", num] as const,
  bestSelling: ["books", "bestSelling"] as const,
  recommended: ["books", "recommended"] as const,
  booksByAuthor: (authorId: string) => ["books", "author", authorId] as const,
  booksByGenre: (genreTitle: string) => ["books", "genre", genreTitle] as const,
};

// Books Hooks
export function useBooks() {
  return useQuery({
    queryKey: queryKeys.books,
    queryFn: () => apiService.getBooks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: () => apiService.getBook(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBestSellingBooks() {
  return useQuery({
    queryKey: queryKeys.bestSelling,
    queryFn: () => apiService.getBestSellingBooks(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendedBooks() {
  return useQuery({
    queryKey: queryKeys.recommended,
    queryFn: () => apiService.getRecommendedBooks(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBooksByAuthor(authorId: string) {
  return useQuery({
    queryKey: queryKeys.booksByAuthor(authorId),
    queryFn: () => apiService.getBooksByAuthor(authorId),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBooksByGenre(genreTitle: string) {
  return useQuery({
    queryKey: queryKeys.booksByGenre(genreTitle),
    queryFn: () => apiService.getBooksByGenre(genreTitle),
    enabled: !!genreTitle,
    staleTime: 5 * 60 * 1000,
  });
}

// Authors Hooks
export function useAuthors() {
  return useQuery({
    queryKey: queryKeys.authors,
    queryFn: () => apiService.getAuthors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAuthor(id: string) {
  return useQuery({
    queryKey: queryKeys.author(id),
    queryFn: () => apiService.getAuthor(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Genres Hooks
export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres,
    queryFn: () => apiService.getGenres(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useGenre(id: string) {
  return useQuery({
    queryKey: queryKeys.genre(id),
    queryFn: () => apiService.getGenre(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
}

// Search Hooks
export function useSearch(params: SearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: async () => {
      const response = await apiService.search(params);
      return response.result; // Return just the books array for backward compatibility
    },
    enabled: enabled && (!!params.q || !!params.genre || !!params.author),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

// Hook for full search response with pagination data
export function useSearchWithPagination(
  params: SearchParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["search-paginated", params],
    queryFn: () => apiService.search(params),
    enabled: enabled && (!!params.q || !!params.genre || !!params.author),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    placeholderData: keepPreviousData,
  });
}

export function useRandomBooks(num: number = 10) {
  return useQuery({
    queryKey: queryKeys.randomBooks(num),
    queryFn: () => apiService.getRandomBooks(num),
    staleTime: 1 * 60 * 1000, // 1 minute for random books
  });
}

// Mutation Hooks
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookData) => apiService.createBook(data),
    onSuccess: () => {
      // Invalidate and refetch book queries
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.bestSelling });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommended });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBookData> }) =>
      apiService.updateBook(id, data),
    onSuccess: (updatedBook) => {
      // Update the specific book query
      queryClient.setQueryData(queryKeys.book(updatedBook.id), updatedBook);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.bestSelling });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommended });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteBook(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: queryKeys.book(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.bestSelling });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommended });
    },
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuthorData) => apiService.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authors });
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGenreData) => apiService.createGenre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genres });
    },
  });
}

export function useCreateGenres() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGenreData[]) => apiService.createGenres(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genres });
    },
  });
}

// Convenience hook for searching books with debouncing
export function useSearchBooks(query: string, debounceMs: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useSearch(
    { q: debouncedQuery, full: "true" },
    debouncedQuery.length > 0
  );
}

// Hook for search suggestions (returns limited results without full details)
export function useSearchSuggestions(query: string, debounceMs: number = 200) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      try {
        const response = await apiService.search({
          q: debouncedQuery,
          limit: 10,
        });
        return response.result || []; // Return the books array from SearchResponse
      } catch (error) {
        console.error("Search suggestions error:", error);
        return []; // Return empty array on error
      }
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}
