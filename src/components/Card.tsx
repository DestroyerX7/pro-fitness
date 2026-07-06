import { cn } from "@/lib/nativewind";
import { View, ViewProps } from "react-native";

export default function Card({ className, children, ...props }: ViewProps) {
  return (
    <View
      className={cn("border border-border bg-card rounded-2xl p-4", className)}
      {...props}
    >
      {children}
    </View>
  );
}
