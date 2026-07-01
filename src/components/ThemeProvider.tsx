import { colors } from "@/lib/colors";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ExpoRouterThemeProvider,
} from "expo-router";
import { useColorScheme, vars } from "nativewind";
import { PropsWithChildren } from "react";
import { View } from "react-native";

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
  }),
};

export default function ThemeProvider({ children }: PropsWithChildren) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? themes.dark : themes.light;

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
    <ExpoRouterThemeProvider value={navigationTheme}>
      <View className="flex-1" style={theme}>
        {children}
      </View>
    </ExpoRouterThemeProvider>
  );
}
