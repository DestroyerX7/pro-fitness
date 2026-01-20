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
        primary: "#0080ff",
        "primary-foreground": "#ffffff",
        secondary: "#f0f0f0",
        "secondary-foreground": "#444444",
        muted: "#f8f8f8",
        "muted-foreground": "#888888",
        "card-background": "#ffffff",
        "card-foreground": "#333333",
        border: "#e0e0e0",
        input: "#e0e0e0",
        accent: "#e0f2fe",
        "accent-foreground": "#1e3a8a",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
      },
    },
  },
  plugins: [],
};
