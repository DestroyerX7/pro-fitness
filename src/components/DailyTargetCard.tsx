import React from "react";
import { View } from "react-native";
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

export default function DailyGoalCard({
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
