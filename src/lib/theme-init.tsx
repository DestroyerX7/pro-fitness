import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "user-color-scheme";

export function useThemePreference() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
    //   if (saved === "light" || saved === "dark" || saved === "system") {
    //     setPreference(saved);
    //     setColorScheme(saved);
    //   }
    // });
  }, []);

  const updatePreference = (themePreference: ThemePreference) => {
    setPreference(themePreference);
    setColorScheme(themePreference);
    // AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  return {
    preference, // "light" | "dark" | "system"  <- use this to check if on system
    resolvedScheme: colorScheme, // "light" | "dark"  <- actual applied theme
    setPreference: updatePreference,
  };
}
