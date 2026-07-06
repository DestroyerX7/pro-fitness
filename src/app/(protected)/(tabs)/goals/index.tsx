import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import GoalItem from "@/components/GoalItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import { queryKeys } from "@/constants/query-keys";
import useGoals from "@/hooks/useGoals";
import useTheme from "@/hooks/useTheme";
import { Goal, updateGoal } from "@/lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";

export default function Goals() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();
  const { data: goals, isPending, error, refetch } = useGoals(user.id);

  const [activeTab, setActiveTab] = useState<
    "all" | "visible" | "hidden" | "completed" | "notCompleted"
  >("all");

  const theme = useTheme();

  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleEditGoal = async (goalId: string) => {
    router.push({
      pathname: "/edit/goal/[goalId]",
      params: { goalId },
    });

    await Haptics.selectionAsync();
  };

  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error !== null) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="gap-4 items-center p-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Something went wrong loading your data.
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl"
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <ThemedText className="text-secondary-foreground">
              {isRefreshing ? "Retrying..." : "Try again"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    );
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
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
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

      {goals.length > 0 ? (
        filteredGoals.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() =>
              updateGoalMutation.mutate({
                completed: !goal.completed,
                goalId: goal.id,
              })
            }
            onLongPress={() => handleEditGoal(goal.id)}
          >
            <GoalItem
              name={goal.name}
              description={goal.description}
              completed={goal.completed}
            />
          </Pressable>
        ))
      ) : (
        <View className="gap-4 items-center p-4">
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Your goals will appear here, showing everything you have created.
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl active:opacity-80"
            onPress={() => router.push("/(protected)/(tabs)/log/goal")}
          >
            <ThemedText className="text-secondary-foreground">
              Create Goal
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
