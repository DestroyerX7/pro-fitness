import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER!,
    },
  },
  trustedOrigins: [
    "profitness://",
    "https://appleid.apple.com",

    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "http://localhost:*"]
      : []),
  ],
  plugins: [expo()],
});
