import { colors } from "@/lib/colors";
import { useColorScheme } from "nativewind";
import React from "react";
import { TextInput, TextInputProps } from "react-native";

export default function ThemedTextInput({
  className = "",
  ...props
}: TextInputProps) {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <TextInput
      className={
        "text-foreground p-4 border border-border rounded-xl bg-muted " +
        className
      }
      placeholderTextColor={theme.mutedForeground}
      {...props}
    />
  );
}
