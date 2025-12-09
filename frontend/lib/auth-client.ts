import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "https://ebook-app-backend-c3jr.onrender.com",
  // baseURL: "http://100.83.233.106:3001",
  plugins: [
    expoClient({
      scheme: "ebook-app",
      storagePrefix: "ebook-app",
      storage: SecureStore,
    }),
  ],
});
