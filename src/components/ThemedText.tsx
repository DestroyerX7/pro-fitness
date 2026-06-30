import { cn } from "@/lib/utils";
import { Text, TextProps } from "react-native";

export default function ThemedText({
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Text className={cn("text-foreground", className)} {...props}>
      {children}
    </Text>
  );
}
