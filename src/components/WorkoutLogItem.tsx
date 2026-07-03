import useTheme from "@/hooks/useTheme";
import { WorkoutLogIcon } from "@/lib/types/workout-log-icon";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import WorkoutLogIconDisplay from "./WorkoutLogIconDisplay";

type Props = {
  id: string;
  name: string;
  durationMinutes: number;
  workoutLogIcon: WorkoutLogIcon;
  onEdit?: (id: string) => void;
};

export default function WorkoutLogItem({
  id,
  name,
  durationMinutes,
  workoutLogIcon,
  onEdit,
}: Props) {
  const theme = useTheme();

  return (
    <Card className="flex-row gap-4">
      <WorkoutLogIconDisplay
        workoutLogIcon={workoutLogIcon}
        size={48}
        color={theme.foreground}
      />

      <View className="flex-1 gap-1">
        <ThemedText className="text-lg font-bold">{name}</ThemedText>

        <ThemedText className="text-muted-foreground">
          {durationMinutes} minutes
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
