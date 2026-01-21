/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        foreground: {
          DEFAULT: "#333333",
          dark: "#eeeeee",
        },
        background: {
          DEFAULT: "#ffffff",
          dark: "#111111",
        },
        primary: {
          DEFAULT: "#0080ff",
          dark: "#0080ff",
          foreground: {
            DEFAULT: "#ffffff",
            dark: "#ffffff",
          },
        },
        secondary: {
          DEFAULT: "#f0f0f0",
          dark: "#222222",
          foreground: {
            DEFAULT: "#444444",
            dark: "#eeeeee",
          },
        },
        muted: {
          DEFAULT: "#f8f8f8",
          dark: "#181818",
          foreground: {
            DEFAULT: "#888888",
            dark: "#aaaaaa",
          },
        },
        "card-background": {
          DEFAULT: "#ffffff",
          dark: "#222222",
        },
        "card-foreground": {
          DEFAULT: "#333333",
          dark: "#eeeeee",
        },
        border: {
          DEFAULT: "#e0e0e0",
          dark: "#404040",
        },
        input: {
          DEFAULT: "#e0e0e0",
          dark: "#404040",
        },
        accent: {
          DEFAULT: "#e0f2fe",
          dark: "#1e3a8a",
          foreground: {
            DEFAULT: "#1e3a8a",
            dark: "#e0f2fe",
          },
        },
        destructive: {
          DEFAULT: "#ef4444",
          dark: "#ef4444",
          foreground: {
            DEFAULT: "#ffffff",
            dark: "#ffffff",
          },
        },
      },
    },
  },
  plugins: [],
};
