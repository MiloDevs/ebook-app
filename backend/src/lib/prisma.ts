import type { Context, Next } from "hono";
import { PrismaClient } from "../generated/client.js";
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({
  connectionString: databaseUrl,
});

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}

export function getPrismaClient(): PrismaClient {
  // 1. Check if the client already exists globally
  if (global.prisma) {
    return global.prisma;
  }

  // 2. Load environment variables and set up the Neon adapter
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({
    connectionString: databaseUrl,
  });

  // 3. Create the new client instance
  const prisma = new PrismaClient({ adapter });

  // 4. In development, save the instance to the global object
  if (process.env.NODE_ENV === "development") {
    global.prisma = prisma;
  }

  return prisma;
}

export default withPrisma;
