import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL!,
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: "profitness",
      storagePrefix: "profitness",
      storage: SecureStore,
    }),
  ],
});
