import { useAuth } from "@/components/AuthProvider";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import { baseUrl } from "@/lib/backend";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Goal } from ".";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const { data } = useAuth();

  const { colorScheme } = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      const getGoals = async () => {
        if (data === null) {
          return;
        }

        const response = await axios.get(
          `${baseUrl}/api/get-goals/${data.user.id}`,
        );

        setGoals(response.data.goals);
      };

      getGoals();
    }, []),
  );

  return (
    <SafeAreaView className="p-4 gap-4">
      <ThemedText className="text-4xl font-bold">Goals</ThemedText>

      {goals.map((goal) => (
        <GoalItem
          id={goal.id}
          key={goal.id}
          name={goal.name}
          description={goal.description}
          completed={goal.completed}
          colorScheme={colorScheme}
        />
      ))}
    </SafeAreaView>
  );
}
