import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { TextInput, TextInputProps } from "react-native";

export default function ThemedTextInput({
  className,
  ...props
}: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      className={cn(
        "text-foreground p-4 border border-border rounded-xl bg-muted",
        className,
      )}
      placeholderTextColor={theme.mutedForeground}
      {...props}
    />
  );
}
