/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        foreground: "#333333",
        background: "#ffffff",
        primary: "#3b82f6",
        primaryForeground: "#ffffff",
        secondary: "#f0f0f0",
        secondaryForeground: "#4b5563",
        accent: "#e0f2fe",
        accentForeground: "#1e3a8a",
        muted: "#f9fafb",
        mutedForeground: "#6b7280",
        border: "#e5e7eb",
        input: "#e5e7eb",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        tabInactive: "#a0a0a0",
      },
    },
  },
  plugins: [],
};
