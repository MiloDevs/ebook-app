// API Types based on backend Prisma models
export interface Author {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Genre {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  image_url: string;
  file_url: string;
  description: string;
  best_selling: boolean;
  recommended: boolean;
  rating: number;
  released_at: string;
  created_at: string;
  updated_at: string;
  author_id?: string;
  author?: Author;
  genres?: Genre[];
}

// API Response Types
export interface BooksResponse {
  books: Book[];
}

export interface BookResponse {
  book: Book;
}

export interface AuthorsResponse {
  authors: Author[];
}

export interface AuthorResponse {
  author: Author;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface GenreResponse {
  genre: Genre;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchResponse {
  result: Book[];
  pagination?: PaginationInfo;
}

// Search parameters
export interface SearchParams {
  q?: string;
  genre?: string;
  author?: string;
  full?: string;
  page?: number;
  limit?: number;
}

// API Error Response
export interface ApiError {
  error: string | object;
}

// Create and Update types
export interface CreateBookData {
  title: string;
  image_url: string;
  file_url: string;
  description: string;
  best_selling?: boolean;
  recommended?: boolean;
  rating?: number;
  genres?: { id: string }[];
  released_at: string;
  author_id?: string;
}

export interface CreateAuthorData {
  first_name: string;
  last_name: string;
  full_name: string;
  description?: string;
}

export interface CreateGenreData {
  title: string;
  description: string;
}

// Library Types
export interface Library {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  books?: LibraryBook[];
  _count?: {
    books: number;
  };
}

export interface LibraryBook {
  id: string;
  library_id: string;
  book_id: string;
  created_at: string;
  book?: Book;
  library?: Library;
}

// Library API Response Types
export interface LibrariesResponse {
  libraries: Library[];
}

export interface LibraryResponse {
  library: Library;
}

export interface LibraryBooksResponse {
  books: LibraryBook[];
}

// Create and Update Library Types
export interface CreateLibraryData {
  name: string;
  description?: string;
}

export interface UpdateLibraryData {
  name: string;
  description?: string;
}

export interface AddBookToLibraryData {
  book_id: string;
}

export interface CheckBookInLibraryResponse {
  isInLibrary: boolean;
}
