import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import { createGoal } from "@/lib/api";
import { cn } from "@/lib/nativewind";
import { GoalFormValues, goalSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Goal() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: null,
    },
  });

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all(user.id) }),
  });

  const onSubmit = async (data: GoalFormValues) => {
    try {
      await createGoalMutation.mutateAsync({
        userId: user.id,
        name: data.name,
        description: data.description,
      });

      Toast.show({
        type: "createdGoal",
        text1: "Goal created!",
        text2: data.name,
        topOffset: insets.top + 16,
        onPress: () => router.push("/(protected)/(tabs)/goals"),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't create goal",
        text2: error instanceof Error ? error.message : "Please try again.",
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        <Pressable
          onPress={handleSubmit(onSubmit)}
          className={cn(
            "bg-primary p-4 rounded-xl active:opacity-80",
            formState.isSubmitting && "opacity-50",
          )}
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator color={theme.primaryForeground} />
          ) : (
            <ThemedText className="text-primary-foreground text-center font-semibold">
              Create Goal
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
