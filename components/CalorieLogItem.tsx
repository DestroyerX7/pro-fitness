import { colors } from "@/lib/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";

type Props = {
  id: string;
  name: string;
  calories: number;
  imageUrl?: string | null;
  colorScheme: "light" | "dark" | undefined;
  onEdit?: (id: string) => void;
};

export default function CalorieLogItem({
  id,
  name,
  calories,
  imageUrl = null,
  colorScheme,
  onEdit,
}: Props) {
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  return (
    <Card className="flex-row gap-4">
      {imageUrl !== null ? (
        <Image
          className="w-16 h-16 rounded-md"
          source={{ uri: imageUrl.replace("http://", "https://") }}
        />
      ) : (
        <View className="w-16 h-16 border rounded-md border-border items-center justify-center">
          <MaterialCommunityIcons
            name="food"
            size={32}
            color={theme.foreground}
          />
        </View>
      )}

      <View className="flex-1 gap-1">
        <ThemedText className="text-lg font-bold">{name}</ThemedText>

        <ThemedText color="text-muted-foreground">{calories}</ThemedText>
      </View>

      {onEdit !== undefined && (
        <Pressable onPress={() => onEdit(id)}>
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
