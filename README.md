# Pro Fitness

A cross-platform fitness app built with Expo that helps you track your calories, log workout durations, and set personal health goals.

## Features

- **Calorie Logging** — Track your daily food intake and monitor calorie goals
- **Workout Tracking** — Log workouts and durations
- **Goal Setting** — Set and track personal fitness goals
- **Authentication** — Email/password, Google, and Sign in with Apple

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- An [Apple Developer account](https://developer.apple.com/) (for Sign in with Apple)
- A [Google Cloud Console](https://console.cloud.google.com/) project (for Google Sign-In)
- A PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```dotenv
# App
BETTER_AUTH_URL=https://yourdomain.com
EXPO_PUBLIC_BACKEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
# Service ID from Apple Developer Portal (e.g. com.yourcompany.yourapp.si)
APPLE_CLIENT_ID=com.yourcompany.yourapp.si

# Pre-generated JWT — see "Apple Client Secret" section below
APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsImtpZCI6Ij...

# App Bundle ID (e.g. com.yourcompany.yourapp)
APPLE_APP_BUNDLE_IDENTIFIER=com.yourcompany.yourapp

# From your Apple Developer account settings
APPLE_TEAM_ID=ABCDE12345

# Key ID from the Keys page in Apple Developer Portal
APPLE_KEY_ID=ABC123DEF4

# Private key from downloaded .p8 file (only used to generate client secret)
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Resend
RESEND_API_KEY=re_your-resend-api-key
```

## Apple Client Secret

Apple requires a signed JWT as the client secret instead of a static string. **This JWT expires every 6 months** — you must regenerate it before it expires or Sign in with Apple will stop working.

### Generating the Secret

1. Download your `.p8` private key from the [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Copy the private key and set it to the `APPLE_PRIVATE_KEY` environment variable
3. Run the generation script:

```bash
npm run generate-apple-secret
```

3. Copy the output JWT and set it as `APPLE_CLIENT_SECRET` in your `.env`

> ⚠️ **Set a calendar reminder for 5 months** after generating the secret so you have time to rotate it before it expires.

## Deployment

### Deploy API Routes

```bash
npx expo export --platform web --no-ssg
eas deploy --prod
```

If it says the total sourcemap size is too large use

```bash
npx expo export --platform web --no-ssg
eas deploy --prod --no-source-maps
```

### Make a Build (iOS)

```bash
eas build --platform ios --profile development
```

```bash
eas build --platform ios --profile preview
```

```bash
eas build --platform ios --profile production
```

### Submit production Build (iOS)

```bash
eas submit --platform ios
```

## Tech Stack

- [Expo](https://expo.dev/) — Cross-platform React Native framework
- [Better Auth](https://better-auth.com/) — Authentication
- [Drizzle ORM](https://orm.drizzle.team/) — Database ORM
- [Neon PostgreSQL](https://neon.com/) — Database
- [Cloudinary](https://cloudinary.com/) — Image storage and optimization
- [Resend](https://resend.com/home) — Transactional email delivery
