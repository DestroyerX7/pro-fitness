import { authClient } from "@/lib/auth-client";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useThemePreference } from "./ThemeProvider";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isPending } = authClient.useSession();
  const { isLoaded } = useThemePreference();

  useEffect(() => {
    if (!isPending && isLoaded) {
      SplashScreen.hide();
    }
  }, [isPending, isLoaded]);

  return null;
}
