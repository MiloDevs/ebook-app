import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  // baseURL: "https://ebook-app-backend-c3jr.onrender.com",
  baseURL: "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "ebook-app",
      storagePrefix: "ebook-app",
      storage: SecureStore,
    }),
  ],
});
