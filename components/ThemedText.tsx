import React from "react";
import { Text, TextProps } from "react-native";

type Props = {
  variant?:
    | "foreground"
    | "background"
    | "primary"
    | "primary-foreground"
    | "secondary"
    | "secondary-foreground"
    | "muted"
    | "muted-foreground"
    | "accent"
    | "accent-foreground"
    | "destructive"
    | "destructive-foreground"
    | "custom";
} & TextProps;

export default function ThemedText({
  variant = "foreground",
  className = "",
  children,
  ...props
}: Props) {
  const yo = variant !== "custom" ? "text-" + variant : "";

  return (
    <Text className={yo + " " + className} {...props}>
      {children}
    </Text>
  );
}
