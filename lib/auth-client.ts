import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://100.83.233.106:3001", // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: "ebook-app",
      storagePrefix: "ebook-app",
      storage: SecureStore,
    }),
  ],
});
