import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { backendUrl } from "./api";

export const authClient = createAuthClient({
  baseURL: backendUrl,
  plugins: [
    expoClient({
      scheme: "profitness",
      storagePrefix: "profitness",
      storage: SecureStore,
    }),
  ],
});
