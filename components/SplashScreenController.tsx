import { SplashScreen } from "expo-router";
import { useAuth } from "./AuthProvider";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isPending } = useAuth();

  if (!isPending) {
    SplashScreen.hide();
  }

  return null;
}
