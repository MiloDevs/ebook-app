import { apiService } from "../lib/api-service";

// This function creates a default library for a user if they don't have one
export const ensureDefaultLibrary = async (userId: string) => {
  try {
    const libraries = await apiService.getUserLibraries(userId);

    // Check if user already has a default library
    const defaultLibrary = libraries.find((lib) => lib.is_default);

    if (!defaultLibrary) {
      // Create default library
      const newLibrary = await apiService.createLibrary(userId, {
        name: "My Library",
        description: "Your default reading list",
      });

      console.log("Created default library:", newLibrary);
      return newLibrary;
    }

    return defaultLibrary;
  } catch (error) {
    console.error("Failed to ensure default library:", error);
    throw error;
  }
};

// Helper function to add a book to the user's default library
export const addBookToDefaultLibrary = async (
  userId: string,
  bookId: string
) => {
  try {
    const defaultLibrary = await ensureDefaultLibrary(userId);

    const result = await apiService.addBookToLibrary(
      userId,
      defaultLibrary.id,
      {
        book_id: bookId,
      }
    );

    console.log("Added book to default library:", result);
    return result;
  } catch (error) {
    console.error("Failed to add book to default library:", error);
    throw error;
  }
};
