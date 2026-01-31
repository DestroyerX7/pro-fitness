import { cn } from "@/lib/utils";
import React from "react";
import { View, ViewProps } from "react-native";

export default function Card({
  className = "",
  children,
  ...props
}: ViewProps) {
  return (
    <View
      className={cn(
        "border border-border bg-card-background rounded-xl p-4",
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}
