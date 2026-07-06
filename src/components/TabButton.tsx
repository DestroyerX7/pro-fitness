import { cn } from "@/lib/nativewind";
import { Pressable, PressableProps } from "react-native";
import ThemedText from "./ThemedText";

type Props = {
  text: string;
  active: boolean;
} & PressableProps;

export default function TabButton({
  text,
  active,
  className,
  ...props
}: Props) {
  return (
    <Pressable
      className={cn(
        "p-4 rounded-xl active:opacity-80",
        active ? "bg-foreground" : "bg-secondary",
        className,
      )}
      {...props}
    >
      <ThemedText
        className={active ? "text-background" : "text-secondary-foreground"}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
}
