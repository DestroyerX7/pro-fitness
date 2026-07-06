import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, View, ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
}

export function NutritionLogItemSkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Card className="flex-row">
      <View className="flex-1 flex-row gap-4">
        <Animated.View
          className="bg-muted w-16 aspect-square items-center justify-center rounded-xl overflow-hidden"
          style={animatedStyle}
        />

        <View className="flex-1 gap-2">
          <Animated.View
            className="h-8 w-3/4 rounded-lg bg-muted"
            style={animatedStyle}
          />

          <Animated.View
            className="h-8 w-1/2 rounded-lg bg-muted"
            style={animatedStyle}
          />
        </View>
      </View>

      <Animated.View
        className="h-8 w-24 rounded-lg bg-muted"
        style={animatedStyle}
      />
    </Card>
  );
}
