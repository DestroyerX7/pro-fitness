import { expoClient } from "@better-auth/expo/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL!,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    expoClient({
      scheme: "profitness",
      storagePrefix: "profitness",
      storage: SecureStore,
    }),
  ],
});
