import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ViewProps } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";

type Props = {
  name: string;
  completed: boolean;
  description: string | null;
} & ViewProps;

export default function GoalItem({
  name,
  completed,
  description = "",
  className,
  ...props
}: Props) {
  const theme = useTheme();

  return (
    <Card className={cn("flex-row gap-4", className)} {...props}>
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
      </View>
    </Card>
  );
}
