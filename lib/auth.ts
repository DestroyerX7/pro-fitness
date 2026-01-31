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

    // Local web dev
    "http://localhost:8081", // exact match
    "http://127.0.0.1:8081", // in case your browser uses 127.0.0.1
    "http://localhost:**", // wildcard port match (use ** at end)
    "http://127.0.0.1:**", // wildcard port
    "exp://10.0.0.53:8081",

    // Deployed web
    process.env.BETTER_AUTH_URL!,
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL!,
    "https://pro-fitness--2cj349x8z9.expo.app",

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://", // Trust all Expo URLs (prefix matching)
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
  plugins: [expo()],
});
