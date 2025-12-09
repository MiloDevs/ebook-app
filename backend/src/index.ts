import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createAuth } from "./lib/auth.js";
import { logger } from "hono/logger";
import genres from "./routes/genre.route.js";
import author from "./routes/author.route.js";
import book from "./routes/book.route.js";
import file from "./routes/file.route.js";
import search from "./routes/search.route.js";
import library from "./routes/library.route.js";
import { cors } from "hono/cors";
import type { PrismaClient } from "./generated/client.js";
import { getPrismaClient } from "./lib/prisma.js";

const prisma = getPrismaClient();

let auth = createAuth(prisma);

if (!prisma) {
  console.error("Prisma client not found.Auth not initialized");
}

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    prisma: PrismaClient;
  };
};

const app = new Hono<AppEnv>();

app.use(logger());

app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  console.log(c.req.raw.headers);

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const routes = app
  .route("/genre", genres)
  .route("/author", author)
  .route("/book", book)
  .route("/file", file)
  .route("/search", search)
  .route("/library", library);

serve(
  {
    fetch: app.fetch,
    hostname: "0.0.0.0",
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export default app;
export type AppType = typeof routes;
