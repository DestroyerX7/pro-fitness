import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import { createWorkoutLog } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { WorkoutLogFormValues, workoutLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
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

export default function Workout() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, setValue, formState } =
    useForm<WorkoutLogFormValues>({
      resolver: zodResolver(workoutLogSchema),
      defaultValues: {
        name: "",
        durationMinutes: "",
        performedAt: new Date(),
        icon: {
          library: "MaterialCommunityIcons",
          name: "run",
        },
      },
    });

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogs.all(user.id),
      }),
  });

  const onSubmit = async ({
    name,
    durationMinutes,
    performedAt,
    icon,
  }: WorkoutLogFormValues) => {
    try {
      await createWorkoutLogMutation.mutateAsync({
        userId: user.id,
        name,
        durationMinutes: Number(durationMinutes),
        performedAt: toSqlTimestamp(performedAt),
        icon,
      });

      Toast.show({
        type: "loggedWorkout",
        text1: "Logged!",
        text2: `${name} • ${durationMinutes} mins`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Couldn't log workout",
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

          <View className="flex-row flex-wrap gap-2">
            {[
              "Push",
              "Pull",
              "Legs",
              "Upper",
              "Lower",
              "Chest",
              "Shoulders",
              "Arms",
              "Cardio",
            ].map((label) => (
              <Pressable
                key={label}
                onPress={() =>
                  setValue("name", label, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                className="rounded-full border border-border bg-muted px-3 py-2 active:opacity-80"
              >
                <ThemedText className="text-sm">{label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <ThemedText className="text-sm font-medium">Duration</ThemedText>

          <Controller
            control={control}
            name="durationMinutes"
            render={({ field }) => (
              <ThemedTextInput
                placeholder="Duration"
                keyboardType="number-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                className={
                  formState.errors.durationMinutes !== undefined
                    ? "border-destructive"
                    : ""
                }
              />
            )}
          />

          {formState.errors.durationMinutes !== undefined && (
            <ThemedText className="text-destructive text-xs">
              {formState.errors.durationMinutes.message}
            </ThemedText>
          )}

          <View className="flex-row flex-wrap gap-2">
            {["15", "30", "45", "60", "75", "90", "105", "120"].map((label) => (
              <Pressable
                key={label}
                onPress={() =>
                  setValue("durationMinutes", label, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                className="rounded-full border border-border bg-muted px-3 py-2 active:opacity-80"
              >
                <ThemedText className="text-sm">{label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <ThemedText className="text-sm font-medium">Performed at</ThemedText>

          <Controller
            control={control}
            name="performedAt"
            render={({ field }) => (
              <View className="rounded-xl border border-border bg-muted p-1.5">
                <DateTimePicker
                  value={field.value}
                  mode="datetime"
                  onValueChange={(_, selectedDate) =>
                    field.onChange(selectedDate)
                  }
                />
              </View>
            )}
          />
        </View>

        <View className="gap-2">
          <ThemedText className="text-sm font-medium">Icon</ThemedText>

          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <WorkoutIconGrid
                className="p-4 bg-muted border rounded-xl border-border"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
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
              Log Workout
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
