import React from "react";
import { Text, TextProps } from "react-native";

type Props = {
  color?:
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
  color = "foreground",
  className = "",
  children,
  ...props
}: Props) {
  const textColor = color !== "custom" ? `text-${color} ` : " ";

  return (
    <Text className={textColor + className} {...props}>
      {children}
    </Text>
  );
}
