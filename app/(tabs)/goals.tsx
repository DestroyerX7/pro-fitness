import { useAuth } from "@/components/AuthProvider";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import { getGoals, updateGoalCompleted } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Goals() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const { colorScheme } = useColorScheme();

  const {
    data: goals,
    isPending,
    error,
  } = useQuery({
    queryKey: ["goals", authData?.user.id || ""],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getGoals(userId);
    },
    enabled: authData !== null,
  });

  const updateGoalCompletedMutation = useMutation({
    mutationFn: updateGoalCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalCompletedMutation.mutate({ completed, goalId });
  };

  if (error !== null) {
    return <ThemedText>Error</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <SafeAreaView className="p-4 gap-4">
      <ThemedText className="text-4xl font-bold">Goals</ThemedText>

      {goals.map((goal) => (
        <Pressable
          key={goal.id}
          onPress={() => handleUpdateGoalCompleted(!goal.completed, goal.id)}
        >
          <GoalItem
            id={goal.id}
            name={goal.name}
            description={goal.description}
            completed={goal.completed}
            colorScheme={colorScheme}
          />
        </Pressable>
      ))}
    </SafeAreaView>
  );
}
