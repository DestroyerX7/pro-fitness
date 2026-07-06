import { colors } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoRouterThemeProvider,
} from "expo-router";
import { useColorScheme, vars } from "nativewind";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { View } from "react-native";

type ThemePreference = "light" | "dark" | "system";
const storageKey = "theme-preference";

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (theme: ThemePreference) => void;
  isLoaded: boolean;
};

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

const themes = {
  light: vars({
    "--color-foreground": colors.light.foreground,
    "--color-background": colors.light.background,
    "--color-primary": colors.light.primary,
    "--color-primary-foreground": colors.light.primaryForeground,
    "--color-secondary": colors.light.secondary,
    "--color-secondary-foreground": colors.light.secondaryForeground,
    "--color-muted": colors.light.muted,
    "--color-muted-foreground": colors.light.mutedForeground,
    "--color-card-foreground": colors.light.cardForeground,
    "--color-card": colors.light.card,
    "--color-border": colors.light.border,
    "--color-input": colors.light.input,
    "--color-accent": colors.light.accent,
    "--color-accent-foreground": colors.light.accentForeground,
    "--color-destructive": colors.light.destructive,
    "--color-destructive-foreground": colors.light.destructiveForeground,
    "--color-destructive-accent": colors.light.destructiveAccent,
    "--color-nutrition-1": colors.light.nutritionOne,
    "--color-nutrition-2": colors.light.nutritionTwo,
    "--color-nutrition-3": colors.light.nutritionThree,
    "--color-nutrition-4": colors.light.nutritionFour,
    "--color-nutrition-5": colors.light.nutritionFive,
    "--color-chart-1": colors.light.chartOne,
    "--color-chart-2": colors.light.chartTwo,
    "--color-chart-3": colors.light.chartThree,
    "--color-chart-4": colors.light.chartFour,
    "--color-chart-5": colors.light.chartFive,
  }),
  dark: vars({
    "--color-foreground": colors.dark.foreground,
    "--color-background": colors.dark.background,
    "--color-primary": colors.dark.primary,
    "--color-primary-foreground": colors.dark.primaryForeground,
    "--color-secondary": colors.dark.secondary,
    "--color-secondary-foreground": colors.dark.secondaryForeground,
    "--color-muted": colors.dark.muted,
    "--color-muted-foreground": colors.dark.mutedForeground,
    "--color-card-foreground": colors.dark.cardForeground,
    "--color-card": colors.dark.card,
    "--color-border": colors.dark.border,
    "--color-input": colors.dark.input,
    "--color-accent": colors.dark.accent,
    "--color-accent-foreground": colors.dark.accentForeground,
    "--color-destructive": colors.dark.destructive,
    "--color-destructive-foreground": colors.dark.destructiveForeground,
    "--color-destructive-accent": colors.dark.destructiveAccent,
    "--color-nutrition-1": colors.dark.nutritionOne,
    "--color-nutrition-2": colors.dark.nutritionTwo,
    "--color-nutrition-3": colors.dark.nutritionThree,
    "--color-nutrition-4": colors.dark.nutritionFour,
    "--color-nutrition-5": colors.dark.nutritionFive,
    "--color-chart-1": colors.dark.chartOne,
    "--color-chart-2": colors.dark.chartTwo,
    "--color-chart-3": colors.dark.chartThree,
    "--color-chart-4": colors.dark.chartFour,
    "--color-chart-5": colors.dark.chartFive,
  }),
};

export default function ThemeProvider({ children }: PropsWithChildren) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setPreferenceState(stored);
          setColorScheme(stored);
        }
      })
      .catch((e) => console.warn("Failed to load theme preference", e))
      .finally(() => setIsLoaded(true));
  }, [setColorScheme]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      setColorScheme(next);
      AsyncStorage.setItem(storageKey, next).catch((e) =>
        console.warn("Failed to save theme preference", e),
      );
    },
    [setColorScheme],
  );

  const navigationTheme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.dark.background,
            primary: colors.dark.primary,
            card: colors.dark.card,
            text: colors.dark.foreground,
            border: colors.dark.border,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.light.background,
            primary: colors.light.primary,
            card: colors.light.card,
            text: colors.light.foreground,
            border: colors.light.border,
          },
        };

  return (
    <ThemePreferenceContext.Provider
      value={{
        preference,
        setPreference,
        isLoaded,
      }}
    >
      <ExpoRouterThemeProvider value={navigationTheme}>
        <View
          className="flex-1"
          style={colorScheme === "dark" ? themes.dark : themes.light}
        >
          {children}
        </View>
      </ExpoRouterThemeProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);

  if (ctx === null) {
    throw new Error("useThemePreference must be used within a ThemeProvider");
  }

  return ctx;
}
