import useTheme from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View } from "react-native";
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
  title: string;
  completedAmount: number;
  targetAmount: number;
  fillColor?: string;
  remainingText?: string;
  topRight?: React.ReactNode;
};

export default function DailyTargetCard({
  title,
  completedAmount,
  targetAmount,
  fillColor = "#30d030",
  remainingText,
  topRight,
}: Props) {
  return (
    <Card className="gap-4">
      <View className="flex-row justify-between">
        <ThemedText className="text-2xl font-bold">{title}</ThemedText>

        {topRight}
      </View>

      <ThemedText>
        <ThemedText className="text-4xl font-bold">
          {completedAmount}
        </ThemedText>{" "}
        / {targetAmount}
      </ThemedText>

      <View className="h-8 bg-border rounded-full">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min((completedAmount / targetAmount) * 100, 100)}%`,
            backgroundColor: fillColor,
          }}
        />
      </View>

      <View className="flex-row justify-between">
        <ThemedText>
          {Math.max(targetAmount - completedAmount, 0)}{" "}
          {remainingText !== undefined && remainingText + " "}
          remaining
        </ThemedText>

        <ThemedText>
          {((completedAmount / targetAmount) * 100).toFixed(2)}%
        </ThemedText>
      </View>
    </Card>
  );
}

export function DailyTargetCardSkeleton({ title }: { title: string }) {
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

  const theme = useTheme();

  return (
    <Card className="gap-4">
      <View className="flex-row justify-between">
        <ThemedText className="text-2xl font-bold">{title}</ThemedText>

        <View>
          <MaterialCommunityIcons
            name="pencil"
            size={24}
            color={theme.foreground}
          />
        </View>
      </View>

      <Animated.View
        className="h-8 w-1/4 bg-border rounded-md"
        style={animatedStyle}
      />

      <Animated.View
        className="h-8 bg-border rounded-full"
        style={animatedStyle}
      />

      <View className="flex-row justify-between">
        <Animated.View
          className="h-8 bg-border w-1/2 rounded-md"
          style={animatedStyle}
        />

        <Animated.View
          className="h-8 bg-border w-1/4 rounded-md"
          style={animatedStyle}
        />
      </View>
    </Card>
  );
}
