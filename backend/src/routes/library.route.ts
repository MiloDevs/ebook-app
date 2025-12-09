import { Hono } from "hono";
import withPrisma from "../lib/prisma.js";
import type { AppEnv } from "../index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const createLibrarySchema = z.object({
  name: z.string().min(1, "Library name is required"),
  description: z.string().optional(),
});

const addBookToLibrarySchema = z.object({
  book_id: z.uuid("Invalid book ID"),
});

const app = new Hono<AppEnv>()
  // Get user's libraries
  .get("/:userId", withPrisma, async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");

      const libraries = await prisma.library.findMany({
        where: { user_id: userId },
        include: {
          _count: {
            select: { books: true },
          },
        },
        orderBy: [
          { is_default: "desc" },
          { created_at: "asc" },
        ],
      });

      return c.json({ libraries });
    } catch (error) {
      console.error("Error fetching libraries:", error);
      return c.json({ error: "Failed to fetch libraries" }, 500);
    }
  })

  // Create new library
  .post("/:userId", withPrisma, zValidator("json", createLibrarySchema), async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const { name, description } = c.req.valid("json");

      // Check if library with same name already exists for user
      const existingLibrary = await prisma.library.findFirst({
        where: { 
          user_id: userId, 
          name: name 
        },
      });

      if (existingLibrary) {
        return c.json({ error: "Library with this name already exists" }, 409);
      }

      const library = await prisma.library.create({
        data: {
          name,
          description,
          user_id: userId,
        },
        include: {
          _count: {
            select: { books: true },
          },
        },
      });

      return c.json({ library }, 201);
    } catch (error) {
      console.error("Error creating library:", error);
      return c.json({ error: "Failed to create library" }, 500);
    }
  })

  // Get library with books
  .get("/:userId/:libraryId", withPrisma, async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");

      const library = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
        include: {
          books: {
            include: {
              book: {
                include: {
                  author: true,
                  genres: true,
                },
              },
            },
          },
          _count: {
            select: { books: true },
          },
        },
      });

      if (!library) {
        return c.json({ error: "Library not found" }, 404);
      }

      return c.json({ library });
    } catch (error) {
      console.error("Error fetching library:", error);
      return c.json({ error: "Failed to fetch library" }, 500);
    }
  })

  // Update library
  .put("/:userId/:libraryId", withPrisma, zValidator("json", createLibrarySchema), async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");
      const { name, description } = c.req.valid("json");

      // Check if library exists and belongs to user
      const existingLibrary = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
      });

      if (!existingLibrary) {
        return c.json({ error: "Library not found" }, 404);
      }

      // Check if another library with same name exists for user
      if (name !== existingLibrary.name) {
        const duplicateLibrary = await prisma.library.findFirst({
          where: { 
            user_id: userId, 
            name: name,
            id: { not: libraryId }
          },
        });

        if (duplicateLibrary) {
          return c.json({ error: "Library with this name already exists" }, 409);
        }
      }

      const library = await prisma.library.update({
        where: { id: libraryId },
        data: {
          name,
          description,
        },
        include: {
          _count: {
            select: { books: true },
          },
        },
      });

      return c.json({ library });
    } catch (error) {
      console.error("Error updating library:", error);
      return c.json({ error: "Failed to update library" }, 500);
    }
  })

  // Delete library
  .delete("/:userId/:libraryId", withPrisma, async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");

      // Check if library exists and belongs to user
      const library = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
      });

      if (!library) {
        return c.json({ error: "Library not found" }, 404);
      }

      // Don't allow deletion of default library
      if (library.is_default) {
        return c.json({ error: "Cannot delete default library" }, 400);
      }

      await prisma.library.delete({
        where: { id: libraryId },
      });

      return c.json({ message: "Library deleted successfully" });
    } catch (error) {
      console.error("Error deleting library:", error);
      return c.json({ error: "Failed to delete library" }, 500);
    }
  })

  // Add book to library
  .post("/:userId/:libraryId/books", withPrisma, zValidator("json", addBookToLibrarySchema), async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");
      const { book_id } = c.req.valid("json");

      // Verify library belongs to user
      const library = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
      });

      if (!library) {
        return c.json({ error: "Library not found" }, 404);
      }

      // Verify book exists
      const book = await prisma.book.findUnique({
        where: { id: book_id },
      });

      if (!book) {
        return c.json({ error: "Book not found" }, 404);
      }

      // Check if book already in library
      const existingEntry = await prisma.libraryBook.findFirst({
        where: {
          library_id: libraryId,
          book_id: book_id,
        },
      });

      if (existingEntry) {
        return c.json({ error: "Book already in library" }, 409);
      }

      const libraryBook = await prisma.libraryBook.create({
        data: {
          library_id: libraryId,
          book_id: book_id,
        },
        include: {
          book: {
            include: {
              author: true,
              genres: true,
            },
          },
        },
      });

      return c.json({ libraryBook }, 201);
    } catch (error) {
      console.error("Error adding book to library:", error);
      return c.json({ error: "Failed to add book to library" }, 500);
    }
  })

  // Remove book from library
  .delete("/:userId/:libraryId/books/:bookId", withPrisma, async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");
      const bookId = c.req.param("bookId");

      // Verify library belongs to user
      const library = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
      });

      if (!library) {
        return c.json({ error: "Library not found" }, 404);
      }

      // Find and delete the library book entry
      const libraryBook = await prisma.libraryBook.findFirst({
        where: {
          library_id: libraryId,
          book_id: bookId,
        },
      });

      if (!libraryBook) {
        return c.json({ error: "Book not found in library" }, 404);
      }

      await prisma.libraryBook.delete({
        where: { id: libraryBook.id },
      });

      return c.json({ message: "Book removed from library successfully" });
    } catch (error) {
      console.error("Error removing book from library:", error);
      return c.json({ error: "Failed to remove book from library" }, 500);
    }
  })

  // Check if book is in library
  .get("/:userId/:libraryId/books/:bookId/check", withPrisma, async (c) => {
    try {
      const prisma = c.get("prisma");
      const userId = c.req.param("userId");
      const libraryId = c.req.param("libraryId");
      const bookId = c.req.param("bookId");

      // Verify library belongs to user
      const library = await prisma.library.findFirst({
        where: { 
          id: libraryId, 
          user_id: userId 
        },
      });

      if (!library) {
        return c.json({ error: "Library not found" }, 404);
      }

      const libraryBook = await prisma.libraryBook.findFirst({
        where: {
          library_id: libraryId,
          book_id: bookId,
        },
      });

      return c.json({ isInLibrary: !!libraryBook });
    } catch (error) {
      console.error("Error checking book in library:", error);
      return c.json({ error: "Failed to check book in library" }, 500);
    }
  });

export default app;