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
import { colors } from "@/lib/colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Goals() {
  const { data: authData } = useAuth();

  const queryClient = useQueryClient();

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [activeTab, setActiveTab] = useState<
    "all" | "visable" | "hidden" | "completed" | "notCompleted"
  >("all");

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

  const filteredGoals =
    activeTab === "all"
      ? goals
      : activeTab === "visable"
        ? goals.filter((g) => !g.hidden)
        : activeTab === "hidden"
          ? goals.filter((g) => g.hidden)
          : activeTab === "completed"
            ? goals.filter((g) => g.completed)
            : goals.filter((g) => !g.completed);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      {editingGoal !== null && (
        <EditGoalModal
          goal={editingGoal}
          close={() => setEditingGoal(null)}
          onSave={saveGoal}
          onDelete={handleDeleteGoal}
        />
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 16, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText className="text-4xl font-bold">Goals</ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            className="p-4 rounded-xl"
            style={{
              backgroundColor:
                activeTab === "all" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("all")}
          >
            <ThemedText
              color={
                activeTab === "all"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              All
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "visable" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("visable")}
          >
            <ThemedText
              color={
                activeTab === "visable"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Visable
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "hidden" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("hidden")}
          >
            <ThemedText
              color={
                activeTab === "hidden"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Hidden
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "completed" ? theme.foreground : theme.secondary,
            }}
            onPress={() => setActiveTab("completed")}
          >
            <ThemedText
              color={
                activeTab === "completed"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Completed
            </ThemedText>
          </Pressable>

          <Pressable
            className="p-4 bg-secondary rounded-xl"
            style={{
              backgroundColor:
                activeTab === "notCompleted"
                  ? theme.foreground
                  : theme.secondary,
            }}
            onPress={() => setActiveTab("notCompleted")}
          >
            <ThemedText
              color={
                activeTab === "notCompleted"
                  ? "text-background"
                  : "text-secondary-foreground"
              }
            >
              Not Completed
            </ThemedText>
          </Pressable>
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
              colorScheme={colorScheme}
              onEdit={() => setEditingGoal(goal)}
            />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
