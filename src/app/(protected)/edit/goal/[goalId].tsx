import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import { deleteGoal, getGoal, Goal, updateGoal } from "@/lib/api";
import { cn } from "@/lib/nativewind";
import { GoalFormValues, goalSchema } from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

function GoalForm({ goal }: { goal: Goal }) {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      description: goal.description,
      completed: goal.completed,
      hidden: goal.hidden,
    },
  });

  const theme = useTheme();

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.all(user.id),
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.all(user.id),
      });
    },
  });

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${goal.name}`,
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGoalMutation.mutate(goal.id, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  "Couldn't delete",
                  "Something went wrong while deleting this goal. Please try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const onSubmit = async (data: GoalFormValues) => {
    // Could maybe use formState.isDirty
    if (
      goal.name === data.name &&
      goal.description === data.description &&
      goal.completed === data.completed &&
      goal.hidden === data.hidden
    ) {
      return;
    }

    updateGoalMutation.mutate(
      {
        name: data.name,
        description: data.description,
        completed: data.completed,
        hidden: data.hidden,
        goalId: goal.id,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Couldn't save",
            "Something went wrong while saving this log. Please try again.",
          ),
      },
    );
  };

  const isSaving = formState.isSubmitting || updateGoalMutation.isPending;
  const isDeleting = deleteGoalMutation.isPending;
  const hasUnsavedChanges = formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Controller
              control={control}
              name="hidden"
              render={({ field }) => (
                <Pressable
                  onPress={() => field.onChange(!field.value)}
                  onBlur={field.onBlur}
                  className="p-2 justify-center items-center flex-row gap-2"
                >
                  <MaterialCommunityIcons
                    name={field.value ? "eye" : "eye-off"}
                    size={24}
                    color={theme.foreground}
                  />

                  <ThemedText>{field.value ? "Show" : "Hide"}</ThemedText>
                </Pressable>
              )}
            />
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="p-4 gap-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <ThemedText className="text-sm font-medium">Name</ThemedText>

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  className={
                    formState.errors.name !== undefined
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.name !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.name.message}
              </ThemedText>
            )}
          </View>

          <View className="gap-2">
            <ThemedText className="text-sm font-medium">Description</ThemedText>

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <ThemedTextInput
                  className={cn(
                    "h-32",
                    formState.errors.description !== undefined
                      ? "border-destructive"
                      : "",
                  )}
                  placeholder="Description..."
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  textAlignVertical="top"
                  multiline
                />
              )}
            />

            {formState.errors.description !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.description.message}
              </ThemedText>
            )}
          </View>

          {/* Status */}
          <View className="gap-2">
            <ThemedText className="text-sm font-medium">Status</ThemedText>

            <Controller
              control={control}
              name="completed"
              render={({ field }) => (
                <Pressable
                  onPress={() => field.onChange(!field.value)}
                  onBlur={field.onBlur}
                  className="bg-muted p-4 rounded-xl border border-border flex-row items-center gap-2"
                >
                  <View
                    className={cn(
                      "w-8 h-8 border-2 rounded-full items-center justify-center",
                      field.value
                        ? "bg-primary border-primary"
                        : "bg-transparent border-border",
                    )}
                  >
                    {field.value && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={theme.primaryForeground}
                      />
                    )}
                  </View>

                  <View className="flex-1 flex-row justify-between">
                    <ThemedText className="font-semibold">
                      {field.value ? "Completed" : "In progress"}
                    </ThemedText>

                    <ThemedText className="text-muted-foreground">
                      {field.value ? "Nice work!" : "Keep going"}
                    </ThemedText>
                  </View>
                </Pressable>
              )}
            />
          </View>

          {/* Created */}
          <View className="gap-2">
            <ThemedText className="text-sm font-medium">Created</ThemedText>

            <ThemedText>
              {new Date(goal.createdAt.toString()).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Save */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className={cn(
              "items-center rounded-xl bg-primary p-4 active:opacity-80",
              isSaving || !hasUnsavedChanges ? "opacity-50" : "",
            )}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <ThemedText className="font-semibold text-primary-foreground">
              {isSaving ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>

          {/* Delete */}
          <Pressable
            className="p-4 rounded-xl bg-muted flex-row items-center justify-center gap-2 active:opacity-80"
            disabled={isDeleting}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="trash-can"
              size={16}
              color={theme.destructive}
            />

            <ThemedText className="text-destructive font-semibold">
              {isDeleting ? "Deleting..." : "Delete"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

export default function EditGoal() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { data: goal, isPending } = useQuery({
    queryKey: queryKeys.goals.one(user.id, goalId),
    queryFn: () => getGoal(goalId),
    initialData: queryClient
      .getQueryData<Goal[]>(queryKeys.goals.all(user.id))
      ?.find((g) => g.id === goalId),
    initialDataUpdatedAt: queryClient.getQueryState(
      queryKeys.goals.all(user.id),
    )?.dataUpdatedAt,
  });

  useEffect(() => {
    if (!isPending && goal === undefined) {
      router.back();
    }
  }, [isPending, goal]);

  if (goal === undefined) {
    return;
  }

  return <GoalForm goal={goal} />;
}
