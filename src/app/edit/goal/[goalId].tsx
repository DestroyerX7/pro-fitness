import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { deleteGoal, Goal, updateGoal } from "@/lib/api";
import { cn } from "@/lib/utils";
import { GoalFormValues, goalSchema } from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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

export default function Screen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const goal =
    authData !== null
      ? queryClient
          .getQueryData<Goal[]>(["goals", authData.user.id])
          ?.find((c) => c.id === goalId)
      : undefined;

  const { control, handleSubmit, formState, setValue } =
    useForm<GoalFormValues>({
      resolver: zodResolver(goalSchema),
      defaultValues: {
        name: goal !== undefined ? goal.name : "",
        description:
          goal !== undefined && goal.description !== null
            ? goal.description
            : "",
      },
    });

  const theme = useTheme();

  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["goals", authData?.user.id],
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["goals", authData?.user.id],
      });
    },
  });

  // Bail out of the screen if there's nothing to edit (e.g. stale cache,
  // deep link to a deleted log). Doing this in an effect rather than during
  // render avoids triggering a navigation side effect mid-render.
  useEffect(() => {
    if (authData === null || goal === undefined) {
      router.back();
    }
  }, [authData, goal]);

  if (goal === undefined) {
    return null;
  }

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
            deleteGoalMutation.mutate(goalId, {
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
    if (goal.name === data.name && goal.description === data.description) {
      return;
    }

    updateGoalMutation.mutate(
      {
        name: data.name,
        description: data.description,
        goalId,
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
                value={field.value}
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
  );
}
