import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Library,
  LibraryBook,
  CreateLibraryData,
  UpdateLibraryData,
  AddBookToLibraryData,
} from "@/types/api";
import { apiService } from "@/lib/api-service";

// Real API service for libraries using the backend
class LibraryService {
  async getUserLibraries(userId: string): Promise<Library[]> {
    return await apiService.getUserLibraries(userId);
  }

  async createLibrary(
    data: CreateLibraryData & { user_id: string }
  ): Promise<Library> {
    const { user_id, ...libraryData } = data;
    return await apiService.createLibrary(user_id, libraryData);
  }

  async updateLibrary(
    userId: string,
    libraryId: string,
    data: UpdateLibraryData
  ): Promise<Library> {
    return await apiService.updateLibrary(userId, libraryId, data);
  }

  async deleteLibrary(userId: string, libraryId: string): Promise<void> {
    return await apiService.deleteLibrary(userId, libraryId);
  }

  async addBookToLibrary(
    userId: string,
    libraryId: string,
    data: AddBookToLibraryData
  ): Promise<LibraryBook> {
    return await apiService.addBookToLibrary(userId, libraryId, data);
  }

  async removeBookFromLibrary(
    userId: string,
    libraryId: string,
    bookId: string
  ): Promise<void> {
    return await apiService.removeBookFromLibrary(userId, libraryId, bookId);
  }

  async getLibrary(userId: string, libraryId: string): Promise<Library> {
    return await apiService.getLibrary(userId, libraryId);
  }

  async isBookInLibrary(
    userId: string,
    libraryId: string,
    bookId: string
  ): Promise<boolean> {
    return await apiService.isBookInLibrary(userId, libraryId, bookId);
  }
}

const libraryService = new LibraryService();

// Query Keys
export const libraryQueryKeys = {
  libraries: (userId: string) => ["libraries", userId] as const,
  library: (id: string) => ["library", id] as const,
  libraryBooks: (libraryId: string) => ["library", libraryId, "books"] as const,
  bookInLibrary: (libraryId: string, bookId: string) =>
    ["library", libraryId, "book", bookId] as const,
};

// Custom Hooks
export function useUserLibraries(userId: string) {
  return useQuery({
    queryKey: libraryQueryKeys.libraries(userId),
    queryFn: () => libraryService.getUserLibraries(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLibrary(userId: string, libraryId: string) {
  return useQuery({
    queryKey: libraryQueryKeys.library(libraryId),
    queryFn: () => libraryService.getLibrary(userId, libraryId),
    enabled: !!userId && !!libraryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIsBookInLibrary(
  userId: string,
  libraryId: string,
  bookId: string
) {
  return useQuery({
    queryKey: libraryQueryKeys.bookInLibrary(libraryId, bookId),
    queryFn: () => libraryService.isBookInLibrary(userId, libraryId, bookId),
    enabled: !!userId && !!libraryId && !!bookId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateLibrary(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLibraryData) =>
      libraryService.createLibrary({ ...data, user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.libraries(userId),
      });
    },
  });
}

export function useUpdateLibrary(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLibraryData }) =>
      libraryService.updateLibrary(userId, id, data),
    onSuccess: (updatedLibrary) => {
      queryClient.setQueryData(
        libraryQueryKeys.library(updatedLibrary.id),
        updatedLibrary
      );
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.libraries(userId),
      });
    },
  });
}

export function useDeleteLibrary(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (libraryId: string) =>
      libraryService.deleteLibrary(userId, libraryId),
    onSuccess: (_, libraryId) => {
      queryClient.removeQueries({
        queryKey: libraryQueryKeys.library(libraryId),
      });
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.libraries(userId),
      });
    },
  });
}

export function useAddBookToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      libraryId,
      book_id,
    }: {
      userId: string;
      libraryId: string;
      book_id: string;
    }) => libraryService.addBookToLibrary(userId, libraryId, { book_id }),
    onSuccess: (_, variables) => {
      // Invalidate library data
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.library(variables.libraryId),
      });
      // Invalidate user's libraries list
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.libraries(variables.userId),
      });
      // Invalidate book in library status
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.bookInLibrary(
          variables.libraryId,
          variables.book_id
        ),
      });
    },
  });
}

export function useRemoveBookFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      libraryId,
      bookId,
    }: {
      userId: string;
      libraryId: string;
      bookId: string;
    }) => libraryService.removeBookFromLibrary(userId, libraryId, bookId),
    onSuccess: (_, variables) => {
      // Invalidate library data
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.library(variables.libraryId),
      });
      // Invalidate user's libraries list
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.libraries(variables.userId),
      });
      // Invalidate book in library status
      queryClient.invalidateQueries({
        queryKey: libraryQueryKeys.bookInLibrary(
          variables.libraryId,
          variables.bookId
        ),
      });
    },
  });
}
