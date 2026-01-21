import React from "react";
import { TextInput, TextInputProps } from "react-native";

export default function ThemedTextInput({
  className,
  ...props
}: TextInputProps) {
  return (
    <TextInput
      className={
        "text-foreground p-4 border border-border rounded-lg " +
        (className || "")
      }
      {...props}
    />
  );
}
