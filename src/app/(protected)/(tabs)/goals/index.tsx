import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import GoalItem from "@/components/GoalItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import { queryKeys } from "@/constants/query-keys";
import useGoals from "@/hooks/useGoals";
import { Goal, updateGoal } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";

export default function Goals() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();
  const { data: goals, isPending, error } = useGoals(user.id);

  const [activeTab, setActiveTab] = useState<
    "all" | "visible" | "hidden" | "completed" | "notCompleted"
  >("all");

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onMutate: async (variables) => {
      // Stop any in-flight refetches so they don't clobber our optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.goals.all(user.id),
      });

      // Snapshot the current cache so we can roll back on error
      const previousGoals = queryClient.getQueryData<Goal[]>(
        queryKeys.goals.all(user.id),
      );

      // Optimistically write the new value into the cache
      queryClient.setQueryData<Goal[]>(queryKeys.goals.all(user.id), (old) =>
        old?.map((goal) =>
          goal.id === variables.goalId ? { ...goal, ...variables } : goal,
        ),
      );

      // Pass the snapshot forward so onError can use it
      return { previousGoals };
    },
    onError: (_error, _variables, context) => {
      // Roll back to the pre-mutation state
      if (context !== undefined && context.previousGoals !== undefined) {
        queryClient.setQueryData(
          queryKeys.goals.all(user.id),
          context.previousGoals,
        );
      }
    },
    onSettled: () => {
      // Always resync with the server afterward, success or failure
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all(user.id) });
    },
  });

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalMutation.mutate({ completed, goalId });
  };

  const handleEditGoal = async (goalId: string) => {
    router.push({
      pathname: "/edit/goal/[goalId]",
      params: { goalId },
    });

    await Haptics.selectionAsync();
  };

  if (error !== null) {
    return <ThemedText>{error.message}</ThemedText>;
  }

  if (isPending) {
    return <ThemedText>Loading...</ThemedText>;
  }

  const filteredGoals =
    activeTab === "all"
      ? goals
      : activeTab === "visible"
        ? goals.filter((g) => !g.hidden)
        : activeTab === "hidden"
          ? goals.filter((g) => g.hidden)
          : activeTab === "completed"
            ? goals.filter((g) => g.completed)
            : goals.filter((g) => !g.completed);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        <TabButton
          text="All"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />

        <TabButton
          text="Visible"
          active={activeTab === "visible"}
          onPress={() => setActiveTab("visible")}
        />

        <TabButton
          text="Hidden"
          active={activeTab === "hidden"}
          onPress={() => setActiveTab("hidden")}
        />

        <TabButton
          text="Completed"
          active={activeTab === "completed"}
          onPress={() => setActiveTab("completed")}
        />

        <TabButton
          text="Not Completed"
          active={activeTab === "notCompleted"}
          onPress={() => setActiveTab("notCompleted")}
        />
      </ScrollView>

      {filteredGoals.map((goal) => (
        <Pressable
          key={goal.id}
          onPress={() => handleUpdateGoalCompleted(!goal.completed, goal.id)}
        >
          <GoalItem
            id={goal.id}
            name={goal.name}
            description={goal.description}
            completed={goal.completed}
            onEdit={handleEditGoal}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
