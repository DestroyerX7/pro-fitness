import { cn } from "@/lib/utils";
import React from "react";
import { Text, TextProps } from "react-native";

type Props = {
  color?:
    | "text-foreground"
    | "text-background"
    | "text-primary"
    | "text-primary-foreground"
    | "text-secondary"
    | "text-secondary-foreground"
    | "text-muted"
    | "text-muted-foreground"
    | "text-accent"
    | "text-accent-foreground"
    | "text-destructive"
    | "text-destructive-foreground"
    | "text-destructive-accent"
    | "";
} & TextProps;
export default function ThemedText({
  color = "text-foreground",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <Text className={cn(color, className)} {...props}>
      {children}
    </Text>
  );
}
