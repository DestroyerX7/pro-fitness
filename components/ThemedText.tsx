import React, { PropsWithChildren } from "react";
import { Text } from "react-native";

type Props = {
  className?: string;
} & PropsWithChildren;

export default function ThemedText({ className, children }: Props) {
  return (
    <Text
      className={
        "text-foreground dark:text-foreground-dark " + (className || "")
      }
    >
      {children}
    </Text>
  );
}
