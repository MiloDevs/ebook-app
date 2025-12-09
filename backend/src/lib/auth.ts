import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import type { PrismaClient } from "../generated/client.js";

/**
 * Function to create the betterAuth instance, guaranteeing it receives the
 * initialized Prisma client.
 * @param prisma The initialized PrismaClient instance.
 */
export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    plugins: [expo()],
    // Pass the guaranteed, initialized 'prisma' client here:
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
      disableOriginCheck: process.env.NODE_ENV != "production",
    },
    debug: true,
  });
}
