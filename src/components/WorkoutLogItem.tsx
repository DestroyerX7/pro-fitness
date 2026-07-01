import useTheme from "@/hooks/useTheme";
import { Icon } from "@/lib/icons";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import { IconDisplay } from "./WorkoutIconGrid";

type Props = {
  id: string;
  name: string;
  duration: number;
  icon: Icon;
  onEdit?: (id: string) => void;
};

export default function WorkoutLogItem({
  id,
  name,
  duration,
  icon,
  onEdit,
}: Props) {
  const theme = useTheme();

  return (
    <Card className="flex-row gap-4">
      <IconDisplay icon={icon} size={48} color={theme.foreground} />

      <View className="flex-1 gap-1">
        <ThemedText className="text-lg font-bold">{name}</ThemedText>

        <ThemedText className="text-muted-foreground">
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
