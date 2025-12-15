import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import type { PrismaClient } from "../generated/client.js";

export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    plugins: [expo()],
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS
      ? process.env.TRUSTED_ORIGINS.split(",")
      : [],
    advanced: {
      disableOriginCheck:
        process.env.NODE_ENV != "production" ||
        !!process.env.DISABLE_ORIGIN_CHECK,
    },
    debug: true,
  });
}
