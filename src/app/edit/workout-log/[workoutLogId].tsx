import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import useTheme from "@/hooks/useTheme";
import {
  createWorkoutLogPreset,
  deleteWorkoutLog,
  updateWorkoutLog,
  WorkoutLog,
} from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { fromSqlTimestampToLocalDate, toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { WorkoutLogFormValues, workoutLogSchema } from "@/lib/zodSchema";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function EditWorkoutLog() {
  const { workoutLogId } = useLocalSearchParams<{ workoutLogId: string }>();
  const queryClient = useQueryClient();
  const { data: authData } = authClient.useSession();

  const workoutLog =
    authData !== null
      ? queryClient
          .getQueryData<WorkoutLog[]>(["workoutLogs", authData.user.id])
          ?.find((c) => c.id === workoutLogId)
      : undefined;

  const { control, handleSubmit, formState, setValue } =
    useForm<WorkoutLogFormValues>({
      resolver: zodResolver(workoutLogSchema),
      defaultValues: {
        name: workoutLog !== undefined ? workoutLog.name : "",
        duration:
          workoutLog !== undefined ? workoutLog.duration.toString() : "",
        performedAt:
          workoutLog !== undefined
            ? fromSqlTimestampToLocalDate(workoutLog.performedAt)
            : new Date(),
        icon:
          workoutLog !== undefined
            ? workoutLog.icon
            : {
                library: "MaterialCommunityIcons",
                name: "run",
              },
      },
    });

  const theme = useTheme();

  const updateWorkoutLogMutation = useMutation({
    mutationFn: updateWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", authData?.user.id],
      });
    },
  });

  const deleteWorkoutLogMutation = useMutation({
    mutationFn: deleteWorkoutLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogs", authData?.user.id],
      });
    },
  });

  const createWorkoutLogPresetMutation = useMutation({
    mutationFn: createWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", workoutLog?.userId],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Bail out of the screen if there's nothing to edit (e.g. stale cache,
  // deep link to a deleted log). Doing this in an effect rather than during
  // render avoids triggering a navigation side effect mid-render.
  useEffect(() => {
    if (authData === null || workoutLog === undefined) {
      router.back();
    }
  }, [authData, workoutLog]);

  if (workoutLog === undefined) {
    return null;
  }

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
      duration: workoutLog.duration,
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
          onPress: () => {
            deleteWorkoutLogMutation.mutate(workoutLogId, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  "Couldn't delete",
                  "Something went wrong while deleting this log. Please try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const onSubmit = async (data: WorkoutLogFormValues) => {
    const durationNum = Number(data.duration);
    const performedAtSqlTimestamp = toSqlTimestamp(data.performedAt);

    // Could maybe use formState.isDirty
    if (
      workoutLog.name === data.name &&
      workoutLog.duration === durationNum &&
      workoutLog.performedAt === performedAtSqlTimestamp &&
      workoutLog.icon.library === data.icon.library &&
      workoutLog.icon.name === data.icon.name
    ) {
      return;
    }

    updateWorkoutLogMutation.mutate(
      {
        name: data.name,
        duration: durationNum,
        performedAt: performedAtSqlTimestamp,
        icon: data.icon,
        workoutLogId,
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

  const isSaving = formState.isSubmitting || updateWorkoutLogMutation.isPending;
  const isDeleting = deleteWorkoutLogMutation.isPending;
  const hasUnsavedChanges = formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="p-2 justify-center items-center flex-row gap-2"
              disabled={createWorkoutLogPresetMutation.isPending}
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
              {["15", "30", "45", "60", "75", "90", "105", "120"].map(
                (label) => (
                  <Pressable
                    key={label}
                    onPress={() =>
                      setValue("duration", label, {
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
