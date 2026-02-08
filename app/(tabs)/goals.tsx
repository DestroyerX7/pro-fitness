import { useAuth } from "@/components/AuthProvider";
import EditGoalModal from "@/components/EditGoalModal";
import GoalItem from "@/components/GoalItem";
import ThemedText from "@/components/ThemedText";
import {
  deleteGoal,
  getGoals,
  Goal,
  updateGoal,
  updateGoalCompleted,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Goals() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const { colorScheme } = useColorScheme();

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const saveGoal = async (editedGoal: Goal) => {
    if (editedGoal === editingGoal) {
      return;
    }

    updateGoalMutation.mutate({ goal: editedGoal });
    setEditingGoal(null);
  };

  const updateGoalCompletedMutation = useMutation({
    mutationFn: updateGoalCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", authData?.user.id] });
    },
  });

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalCompletedMutation.mutate({ completed, goalId });
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoalMutation.mutate({ goalId });
    setEditingGoal(null);
  };

  if (error !== null) {
    return <ThemedText>{error.message}</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <SafeAreaView className="p-4 gap-4">
      {editingGoal !== null && (
        <EditGoalModal
          goal={editingGoal}
          close={() => setEditingGoal(null)}
          onSave={saveGoal}
          onDelete={handleDeleteGoal}
        />
      )}

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
            onEdit={() => setEditingGoal(goal)}
          />
        </Pressable>
      ))}
    </SafeAreaView>
  );
}
