import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
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
      <View className="flex-row flex-1 gap-4">
        <View
          className={cn(
            "w-8 h-8 border-2 rounded-full items-center justify-center",
            completed
              ? "bg-primary border-primary"
              : "bg-transparent border-border",
          )}
        >
          {completed && (
            <MaterialCommunityIcons
              name="check"
              size={16}
              color={theme.primaryForeground}
            />
          )}
        </View>

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
