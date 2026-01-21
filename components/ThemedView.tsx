// import { colors } from "@/lib/colors";
// import { useColorScheme } from "nativewind";
import React, { PropsWithChildren } from "react";
import { View } from "react-native";

export default function ThemedView({ children }: PropsWithChildren) {
  //   const { colorScheme } = useColorScheme();
  //   const theme = colorScheme === "light" ? colors.light : colors.dark;

  return <View className="bg-card dark:bg-card-dark">{children}</View>;
}
