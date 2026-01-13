import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { baseUrl } from "./backend";

export const authClient = createAuthClient({
  baseURL: baseUrl,
  plugins: [
    expoClient({
      scheme: "profitness",
      storagePrefix: "profitness",
      storage: SecureStore,
    }),
  ],
});
