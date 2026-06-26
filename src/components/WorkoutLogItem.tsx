import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import { Icon, IconType } from "./WorkoutIconGrid";

type Props = {
  id: string;
  name: string;
  duration: number;
  iconLibrary: "MaterialIcons" | "MaterialCommunityIcons";
  iconName: string;
  onEdit?: (id: string) => void;
};

export default function WorkoutLogItem({
  id,
  name,
  duration,
  iconLibrary,
  iconName,
  onEdit,
}: Props) {
  const iconType: IconType = {
    library: iconLibrary,
    name: iconName,
  } as IconType;
  const theme = useTheme();

  return (
    <Card className="flex-row gap-4">
      <Icon iconType={iconType} size={48} color={theme.foreground} />

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
