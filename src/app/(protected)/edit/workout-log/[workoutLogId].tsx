import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import {
  createWorkoutLogPreset,
  deleteWorkoutLog,
  getWorkoutLog,
  updateWorkoutLog,
  WorkoutLog,
} from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/nativewind";
import { WorkoutLogFormValues, workoutLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

function WorkoutLogForm({ workoutLog }: { workoutLog: WorkoutLog }) {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState, setValue } =
    useForm<WorkoutLogFormValues>({
      resolver: zodResolver(workoutLogSchema),
      defaultValues: {
        name: workoutLog.name,
        durationMinutes: workoutLog.durationMinutes.toString(),
        performedAt: workoutLog.performedAt,
        icon: workoutLog.icon,
      },
    });

  const theme = useTheme();

  const updateWorkoutLogMutation = useMutation({
    mutationFn: updateWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogs.all(user.id),
      });
      router.back();
    },
    onError: () =>
      Alert.alert(
        "Couldn't save",
        "Something went wrong while saving this log. Please try again.",
      ),
  });

  const deleteWorkoutLogMutation = useMutation({
    mutationFn: deleteWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogs.all(user.id),
      });
      router.back();
    },
    onError: () =>
      Alert.alert(
        "Couldn't delete",
        "Something went wrong while deleting this log. Please try again.",
      ),
  });

  const createWorkoutLogPresetMutation = useMutation({
    mutationFn: createWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogPresets.all(user.id),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleCreateWorkoutLogPreset = () => {
    if (formState.isDirty) {
      Alert.alert(
        "Save changes to create preset",
        "You have unsaved changes. Save them first before you can create preset",
      );

      return;
    }

    createWorkoutLogPresetMutation.mutate({
      userId: workoutLog.userId,
      name: workoutLog.name,
      durationMinutes: workoutLog.durationMinutes,
      icon: workoutLog.icon,
    });
  };

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${workoutLog.name}`,
      "Are you sure you want to delete this workout log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkoutLogMutation.mutate(workoutLog.id),
        },
      ],
    );
  };

  const onSubmit = async ({
    name,
    durationMinutes,
    icon,
    performedAt,
  }: WorkoutLogFormValues) => {
    if (!formState.isDirty) {
      return;
    }

    updateWorkoutLogMutation.mutate({
      name,
      durationMinutes: Number(durationMinutes),
      performedAt: toSqlTimestamp(performedAt),
      icon,
      workoutLogId: workoutLog.id,
    });
  };

  const isSaving = formState.isSubmitting || updateWorkoutLogMutation.isPending;
  const isDeleting = deleteWorkoutLogMutation.isPending;
  const hasUnsavedChanges = formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="p-2 items-center flex-row gap-2"
              disabled={
                isSaving ||
                isDeleting ||
                createWorkoutLogPresetMutation.isPending
              }
              onPress={handleCreateWorkoutLogPreset}
            >
              <MaterialCommunityIcons
                name="tune"
                size={24}
                color={theme.foreground}
              />

              <ThemedText>Create Preset</ThemedText>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              {["15", "30", "45", "60", "75", "90", "105", "120"].map(
                (label) => (
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
                ),
              )}
            </View>
          </View>

          <View className="gap-2">
            <ThemedText className="text-sm font-medium">
              Performed At
            </ThemedText>

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

          {/* Save */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className={cn(
              "items-center rounded-xl bg-primary p-4 active:opacity-80",
              (isSaving || !hasUnsavedChanges || isDeleting) && "opacity-50",
            )}
            disabled={isSaving || !hasUnsavedChanges || isDeleting}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <ThemedText className="font-semibold text-primary-foreground">
                Save
              </ThemedText>
            )}
          </Pressable>

          {/* Delete */}
          <Pressable
            className={cn(
              "p-4 rounded-xl bg-muted items-center active:opacity-80",
              (isDeleting || isSaving) && "opacity-50",
            )}
            disabled={isDeleting || isSaving}
            onPress={handleDelete}
          >
            {isDeleting ? (
              <ActivityIndicator color={theme.destructive} />
            ) : (
              <View className="flex-row gap-1 items-center">
                <MaterialCommunityIcons
                  name="trash-can"
                  size={16}
                  color={theme.destructive}
                />

                <ThemedText className="text-destructive font-semibold">
                  Delete
                </ThemedText>
              </View>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

export default function EditWorkoutLog() {
  const { workoutLogId } = useLocalSearchParams<{ workoutLogId: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const theme = useTheme();

  const { data: workoutLog, isPending } = useQuery({
    queryKey: queryKeys.workoutLogs.one(user.id, workoutLogId),
    queryFn: () => getWorkoutLog(workoutLogId),
    initialData: queryClient
      .getQueryData<WorkoutLog[]>(queryKeys.workoutLogs.all(user.id))
      ?.find((w) => w.id === workoutLogId),
    initialDataUpdatedAt: queryClient.getQueryState(
      queryKeys.workoutLogs.all(user.id),
    )?.dataUpdatedAt,
  });

  useEffect(() => {
    if (!isPending && workoutLog === undefined) {
      router.back();
    }
  }, [isPending, workoutLog]);

  if (workoutLog === undefined) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <ActivityIndicator size="large" color={theme.foreground} />

        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return <WorkoutLogForm workoutLog={workoutLog} />;
}
