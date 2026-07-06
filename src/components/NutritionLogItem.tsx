import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, View, ViewProps } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";

type Props = {
  name: string;
  calories: number;
  imageUrl?: string | null;
  consumedAt?: Date;
} & ViewProps;

export default function NutritionLogItem({
  name,
  calories,
  imageUrl = null,
  consumedAt,
  className,
  ...props
}: Props) {
  const theme = useTheme();

  return (
    <Card className={cn("flex-row", className)} {...props}>
      <View className="flex-1 flex-row gap-4">
        <View
          className={
            "bg-muted w-16 aspect-square items-center justify-center rounded-xl overflow-hidden"
          }
        >
          {imageUrl !== null ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", flex: 1 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="food"
              color={theme.cardForeground}
              size={32}
            />
          )}
        </View>

        <View className="flex-1">
          <ThemedText className="text-card-foreground text-2xl font-bold">
            {name}
          </ThemedText>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="fire"
              color={theme.nutritionOne}
              size={24}
            />

            <ThemedText className="text-card-foreground font-medium">
              {calories} Calories
            </ThemedText>
          </View>
        </View>
      </View>

      {consumedAt !== undefined && (
        <ThemedText className="text-muted-foreground">
          {consumedAt.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </ThemedText>
      )}
    </Card>
  );

  // return (
  //   <Card className="flex-row gap-4">
  //     {imageUrl !== null ? (
  //       <Image
  //         className="w-16 h-16 rounded-md"
  //         source={{ uri: imageUrl.replace("http://", "https://") }}
  //       />
  //     ) : (
  //       <View className="w-16 h-16 border rounded-md border-border items-center justify-center">
  //         <MaterialCommunityIcons
  //           name="food"
  //           size={32}
  //           color={theme.foreground}
  //         />
  //       </View>
  //     )}

  //     <View className="flex-1 gap-1">
  //       <ThemedText className="text-lg font-bold">{name}</ThemedText>

  //       <ThemedText className="text-muted-foreground">{calories}</ThemedText>
  //     </View>

  //     {onEdit !== undefined && (
  //       <Pressable hitSlop={8} onPress={() => onEdit(id)}>
  //         <Ionicons
  //           name="ellipsis-horizontal"
  //           size={24}
  //           color={theme.foreground}
  //         />
  //       </Pressable>
  //     )}
  //   </Card>
  // );
}
