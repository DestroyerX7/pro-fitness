import { db } from "@/db/index"; // your drizzle instance
import * as schema from "@/db/schema";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true, // Enable authentication using email and password.
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      // Optional
      // appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER!,
    },
  },
  trustedOrigins: [
    "profitness://",
    "https://appleid.apple.com",

    // Deployed web
    process.env.BETTER_AUTH_URL!,
    process.env.EXPO_PUBLIC_BACKEND_URL!,

    // Local development
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:**",
          "http://127.0.0.1:**",
          "exp://**", // Expo development URLs
        ]
      : []),
  ],
  plugins: [expo()],
});
