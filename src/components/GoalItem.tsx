import useTheme from "@/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";

type Props = {
  id: string;
  name: string;
  completed: boolean;
  description: string | null;
  onEdit?: (id: string) => void;
};

export default function GoalItem({
  id,
  name,
  completed,
  description = "",
  onEdit,
}: Props) {
  const theme = useTheme();

  return (
    <Card className="flex-row">
      <View className="flex-row flex-1 gap-2">
        <MaterialCommunityIcons
          name={completed ? "check-circle" : "checkbox-blank-circle-outline"}
          size={32}
          color={completed ? theme.primary : theme.mutedForeground}
        />

        <View className="gap-1 flex-1">
          <ThemedText className={"text-lg font-bold"}>{name}</ThemedText>

          <ThemedText className="text-muted-foreground flex-wrap">
            {description}
          </ThemedText>

          <Text style={{ color: completed ? "#30d030" : theme.destructive }}>
            {completed ? "Completed" : "Not completed"}
          </Text>
        </View>
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
