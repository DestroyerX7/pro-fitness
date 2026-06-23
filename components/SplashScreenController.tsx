import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isPending } = useAuth();

  useEffect(() => {
    if (!isPending) {
      SplashScreen.hide();
    }
  }, [isPending]);

  return null;
}
