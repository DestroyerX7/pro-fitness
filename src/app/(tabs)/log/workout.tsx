import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import { createWorkoutLog } from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { WorkoutLogFormValues, workoutLogSchema } from "@/lib/zodSchema";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
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
        duration: "",
        performedAt: new Date(),
        icon: {
          library: "MaterialCommunityIcons",
          name: "run",
        },
      },
    });

  const [logging, setLogging] = useState(false);

  const insets = useSafeAreaInsets();

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", user.id],
      });

      Toast.show({
        type: "loggedWorkout",
        text1: "Logged!",
        text2: `${data.name} • ${data.duration} mins`,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error.message,
        topOffset: insets.top + 16,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const onSubmit = async (data: WorkoutLogFormValues) => {
    const durationNum = Number(data.duration);
    const performedAtSqlTimestamp = toSqlTimestamp(data.performedAt);

    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: data.name,
      duration: durationNum,
      performedAt: performedAtSqlTimestamp,
      iconLibrary: data.icon.library,
      iconName: data.icon.name,
    });
  };

  return (
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
                formState.errors.name !== undefined ? "border-destructive" : ""
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
              onPress={() => setValue("name", label, { shouldValidate: true })}
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
          name="duration"
          render={({ field }) => (
            <ThemedTextInput
              placeholder="Duration"
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              className={
                formState.errors.duration !== undefined
                  ? "border-destructive"
                  : ""
              }
            />
          )}
        />

        {formState.errors.duration !== undefined && (
          <ThemedText className="text-destructive text-xs">
            {formState.errors.duration.message}
          </ThemedText>
        )}

        <View className="flex-row flex-wrap gap-2">
          {["15", "30", "45", "60", "75", "90", "105", "120"].map((label) => (
            <Pressable
              key={label}
              onPress={() =>
                setValue("duration", label, { shouldValidate: true })
              }
              className="rounded-full border border-border bg-muted px-3 py-2 active:opacity-80"
            >
              <ThemedText className="text-sm">{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-2">
        <ThemedText className="text-sm font-medium">Performed At</ThemedText>

        <Controller
          control={control}
          name="performedAt"
          render={({ field }) => (
            <View className="rounded-xl border border-border bg-muted px-2 py-1">
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
            <View className="flex-row gap-4 flex-wrap p-4 bg-muted border rounded-xl border-border">
              <WorkoutIconGrid
                value={field.value}
                onValueChange={field.onChange}
                numColumns={6}
              />
            </View>
          )}
        />
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        className="bg-primary p-4 rounded-xl active:opacity-80"
      >
        <ThemedText className="text-primary-foreground text-center font-semibold">
          Log Workout
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}
