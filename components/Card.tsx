import React, { PropsWithChildren } from "react";
import { View } from "react-native";

type Props = {
  className?: string;
} & PropsWithChildren;

export default function Card({ className, children }: Props) {
  return (
    <View
      className={
        "border border-border bg-card-background rounded-xl p-4 " +
        (className || "")
      }
    >
      {children}
    </View>
  );
}
