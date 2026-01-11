/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        primaryForeground: "#ffffff",
        secondary: "#f3f4f6",
        secondaryForeground: "#4b5563",
        accent: "#e0f2fe",
        accentForeground: "#1e3a8a",
        muted: "#f9fafb",
        mutedForeground: "#6b7280",
        border: "#e5e7eb",
        foreground: "#333333",
        background: "#ffffff",
        input: "#e5e7eb",
      },
    },
  },
  plugins: [],
};
