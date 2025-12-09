import { Hono } from "hono";
import type { AppEnv } from "../index.js";
import withPrisma from "../lib/prisma.js";

function createPrefixedQuery(query: string) {
  if (!query.trim()) return "";
  let cleanQuery = query.replace(/[!\\'()|&']/g, "").trim();

  if (!cleanQuery) return "";

  let words = cleanQuery.split(/\+s/);

  const lastword = words.pop();

  if (lastword) {
    words.push(`${lastword}:*`);
  }

  return words.join(" & ");
}

const app = new Hono<AppEnv>()
  .get("/", withPrisma, async (c) => {
    const prisma = c.get("prisma");
    const query = c.req.query("q");
    const genre = c.req.query("genre");
    const author = c.req.query("author");
    const full = c.req.query("full");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 50); // Max 50 items per page
    const skip = (validPage - 1) * validLimit;

    const searchQuery = query ? createPrefixedQuery(query) : "";
    const genreQuery = genre ? createPrefixedQuery(genre) : "";
    const authorQuery = author ? createPrefixedQuery(author) : "";

    // Build search conditions
    const searchConditions = [];

    if (searchQuery) {
      searchConditions.push(
        {
          title: {
            search: searchQuery,
          },
        },
        {
          description: {
            search: searchQuery,
          },
        },
        {
          genres: {
            some: {
              title: {
                search: searchQuery,
              },
            },
          },
        },
        {
          author: {
            full_name: {
              search: searchQuery,
            },
          },
        }
      );
    }

    if (genreQuery) {
      searchConditions.push({
        genres: {
          some: {
            title: {
              search: genreQuery,
            },
          },
        },
      });
    }

    if (authorQuery) {
      searchConditions.push({
        author: {
          full_name: {
            search: authorQuery,
          },
        },
      });
    }

    const whereCondition =
      searchConditions.length > 0 ? { OR: searchConditions } : {};

    const select = full
      ? {
          id: true,
          title: true,
          description: true,
          image_url: true,
          file_url: true,
          best_selling: true,
          recommended: true,
          rating: true,
          released_at: true,
          created_at: true,
          updated_at: true,
          author: {
            select: {
              id: true,
              full_name: true,
            },
          },
          genres: {
            select: {
              id: true,
              title: true,
            },
          },
        }
      : {
          id: true,
          title: true,
          author: {
            select: {
              full_name: true,
            },
          },
        };

    // Get total count for pagination
    const total = await prisma.book.count({
      where: whereCondition,
    });

    // Get paginated results
    const result = await prisma.book.findMany({
      where: whereCondition,
      select,
      skip,
      take: validLimit,
      orderBy: [
        { recommended: "desc" },
        { best_selling: "desc" },
        { created_at: "desc" },
      ],
    });

    const totalPages = Math.ceil(total / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPreviousPage = validPage > 1;

    return c.json({
      result,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  })
  .get("/random", withPrisma, async (c) => {
    const prisma = c.get("prisma");
    const num = parseInt(c.req.query("num") || "3");

    const bookIds = (await prisma.$queryRawUnsafe(
      `select id from book order by RANDOM() limit $1`,
      num
    )) as { id: string }[];

    const flatbookIds = bookIds.map((book) => book.id);

    const result = await prisma.book.findMany({
      where: {
        id: {
          in: flatbookIds,
        },
      },
      include: {
        author: true,
      },
    });

    return c.json({ result });
  });

export default app;
