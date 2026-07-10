import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View, ViewProps } from "react-native";
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

        {description !== null && (
          <ThemedText className="text-muted-foreground flex-wrap">
            {description}
          </ThemedText>
        )}
      </View>
    </Card>
  );
}

export function GoalItemSkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Card className="flex-row gap-4">
      <View className="w-8 h-8 border-2 rounded-full items-center justify-center bg-transparent border-border" />

      <View className="gap-2 flex-1">
        <Animated.View
          className="h-8 w-1/2 rounded-lg bg-border"
          style={animatedStyle}
        />

        <Animated.View
          className="h-8 rounded-md bg-border"
          style={animatedStyle}
        />
      </View>
    </Card>
  );
}
