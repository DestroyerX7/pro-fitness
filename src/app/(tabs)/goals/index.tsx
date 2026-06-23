import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import GoalItem from "@/components/GoalItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import useGoals from "@/hooks/useGoals";
import { updateGoalCompleted } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";

export default function Goals() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();
  const { data: goals, isPending, error } = useGoals(user.id);

  // const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [activeTab, setActiveTab] = useState<
    "all" | "visible" | "hidden" | "completed" | "notCompleted"
  >("all");

  // const updateGoalMutation = useMutation({
  //   mutationFn: updateGoal,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
  //   },
  // });

  // const deleteGoalMutation = useMutation({
  //   mutationFn: deleteGoal,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
  //   },
  // });

  // const saveGoal = async (editedGoal: Goal) => {
  //   if (editedGoal === editingGoal) {
  //     return;
  //   }

  //   updateGoalMutation.mutate({ goal: editedGoal });
  //   setEditingGoal(null);
  // };

  const updateGoalCompletedMutation = useMutation({
    mutationFn: updateGoalCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
    },
  });

  const handleUpdateGoalCompleted = (completed: boolean, goalId: string) => {
    updateGoalCompletedMutation.mutate({ completed, goalId });
  };

  const editGoal = (goalId: string) => {};

  // const handleDeleteGoal = (goalId: string) => {
  //   deleteGoalMutation.mutate({ goalId });
  //   setEditingGoal(null);
  // };

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
      {/* {editingGoal !== null && (
        <EditGoalModal
          goal={editingGoal}
          close={() => setEditingGoal(null)}
          onSave={saveGoal}
          onDelete={handleDeleteGoal}
        />
      )} */}
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
            onEdit={editGoal}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
