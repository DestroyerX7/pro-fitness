import { colors } from "@/lib/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import { iconLibraries } from "./WorkoutIconList";

type Props = {
  id: string;
  name: string;
  duration: number;
  iconLibrary: "MaterialIcons" | "MaterialCommunityIcons";
  iconName: string;
  colorScheme: "light" | "dark" | undefined;
  onEdit?: (id: string) => void;
};

export default function WorkoutLogItem({
  id,
  name,
  duration,
  iconLibrary,
  iconName,
  colorScheme,
  onEdit,
}: Props) {
  const theme = colorScheme === "light" ? colors.light : colors.dark;
  const IconComponent = iconLibraries[iconLibrary];

  return (
    <Card className="flex-row gap-4">
      <IconComponent
        name={iconName as any}
        size={48}
        color={theme.foreground}
      />

      <View className="flex-1 gap-1">
        <ThemedText className="text-lg font-bold">{name}</ThemedText>

        <ThemedText color="text-muted-foreground">
          {duration} minutes
        </ThemedText>
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
