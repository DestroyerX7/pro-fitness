import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Pressable, PressableProps, StyleProp } from "react-native";
import ThemedText from "./ThemedText";

type Props = {
  text: string;
  active: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<PressableProps>;
};

export default function TabButton({
  text,
  active,
  onPress,
  className,
  style,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      className={cn("p-4 rounded-xl", className)}
      style={[
        {
          backgroundColor: active ? theme.foreground : theme.secondary,
        },
        style,
      ]}
      onPress={onPress}
    >
      <ThemedText
        color={active ? "text-background" : "text-secondary-foreground"}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
}
