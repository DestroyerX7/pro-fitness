import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { WorkoutLogIcon } from "@/lib/types/workout-log-icon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ViewProps } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import WorkoutLogIconDisplay from "./WorkoutLogIconDisplay";

type Props = {
  name: string;
  durationMinutes: number;
  workoutLogIcon: WorkoutLogIcon;
  performedAt?: Date;
} & ViewProps;

export default function WorkoutLogItem({
  name,
  durationMinutes,
  workoutLogIcon,
  performedAt,
  className,
  ...props
}: Props) {
  const theme = useTheme();

  return (
    <Card className={cn("flex-row gap-4", className)} {...props}>
      <View
        className={
          "bg-muted w-16 aspect-square items-center justify-center rounded-xl overflow-hidden"
        }
      >
        <WorkoutLogIconDisplay
          workoutLogIcon={workoutLogIcon}
          color={theme.cardForeground}
          size={32}
        />
      </View>

      <View className="flex-1">
        <ThemedText className="text-card-foreground text-2xl font-bold">
          {name}
        </ThemedText>

        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons
            name="timelapse"
            color={theme.primary}
            size={24}
          />

          <ThemedText className="text-card-foreground font-medium">
            {durationMinutes} Minutes
          </ThemedText>
        </View>
      </View>

      {performedAt !== undefined && (
        <ThemedText className="text-muted-foreground">
          {performedAt.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </ThemedText>
      )}
    </Card>
  );
}
