interface Genre {
  title: string;
  description: string;
}

interface Book {
  title: string;
  author: string;
  imageUrl: string;
  fileUrl: string;
  description: string;
  bestSelling: boolean;
  recommended: boolean;
  rating: number;
  genres?: Genre[];
  releasedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Reading {
  book: Book;
  progress: number;
}

export { Book, Genre, Reading };
