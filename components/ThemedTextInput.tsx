import React from "react";
import { TextInput, TextInputProps } from "react-native";

export default function ThemedTextInput({
  className,
  ...props
}: TextInputProps) {
  return (
    <TextInput
      className={
        "text-foreground dark:text-foreground-dark p-4 border border-border rounded-lg dark:border-border-dark " +
        (className || "")
      }
      {...props}
    />
  );
}
