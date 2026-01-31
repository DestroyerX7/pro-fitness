import { colors } from "@/lib/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";

type Props = {
  id: string;
  name: string;
  completed: boolean;
  description: string;
  colorScheme: "light" | "dark" | undefined;
  onEdit?: (id: string) => void;
};

export default function GoalItem({
  id,
  name,
  completed,
  description,
  colorScheme,
  onEdit,
}: Props) {
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <Card className="flex-row">
      <View className="flex-row flex-1 gap-4">
        <View className="w-16 h-16 rounded-full items-center justify-center bg-border">
          {completed && (
            <MaterialCommunityIcons
              name="check"
              color={theme.foreground}
              size={32}
            />
          )}
        </View>

        <View className="gap-1 flex-1">
          <ThemedText className="text-lg font-bold">{name}</ThemedText>

          <ThemedText color="text-muted-foreground" className="flex-wrap">
            {description}
          </ThemedText>
        </View>
      </View>

      {onEdit !== undefined && (
        <Pressable>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.foreground}
          />
        </Pressable>
      )}
    </Card>
  );
}
