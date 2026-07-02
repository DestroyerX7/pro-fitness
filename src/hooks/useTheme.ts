import { colors } from "@/constants/colors";
import { useColorScheme } from "nativewind";

export default function useTheme() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? colors.dark : colors.light;
  return theme;
}
