import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import {
  deleteWorkoutLogPreset,
  getWorkoutLogPreset,
  updateWorkoutLogPreset,
  WorkoutLogPreset,
} from "@/lib/api";
import { cn } from "@/lib/nativewind";
import {
  WorkoutLogPresetFormValues,
  workoutLogPresetSchema,
} from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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

function WorkoutLogPresetForm({
  workoutLogPreset,
}: {
  workoutLogPreset: WorkoutLogPreset;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { control, handleSubmit, formState, setValue } =
    useForm<WorkoutLogPresetFormValues>({
      resolver: zodResolver(workoutLogPresetSchema),
      defaultValues: {
        name: workoutLogPreset.name,
        durationMinutes: workoutLogPreset.durationMinutes.toString(),
        icon: workoutLogPreset.icon,
      },
    });

  const theme = useTheme();

  const updateWorkoutLogPresetMutation = useMutation({
    mutationFn: updateWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogPresets.all(user.id),
      });

      router.back();
    },
    onError: (error) => {
      Alert.alert("Couldn't save", error.message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const deleteWorkoutLogPresetMutation = useMutation({
    mutationFn: deleteWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogPresets.all(user.id),
      });

      router.back();
    },
    onError: (error) => {
      Alert.alert("Couldn't delete", error.message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleDelete = async () => {
    Alert.alert(
      `Delete ${workoutLogPreset.name}`,
      "Are you sure you want to delete this workout log preset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteWorkoutLogPresetMutation.mutate(workoutLogPreset.id),
        },
      ],
    );

    Haptics.selectionAsync();
  };

  const onSubmit = async ({
    name,
    durationMinutes,
    icon,
  }: WorkoutLogPresetFormValues) => {
    if (!formState.isDirty) {
      return;
    }

    updateWorkoutLogPresetMutation.mutate({
      name,
      durationMinutes: Number(durationMinutes),
      icon,
      workoutLogPresetId: workoutLogPreset.id,
    });
  };

  const canSave =
    !updateWorkoutLogPresetMutation.isPending &&
    !deleteWorkoutLogPresetMutation.isPending &&
    formState.isDirty;
  const canDelete =
    !updateWorkoutLogPresetMutation.isPending &&
    !deleteWorkoutLogPresetMutation.isPending;

  return (
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
        {/* Name */}
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

        {/* Duration */}
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

        {/* Icon */}
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
            !canSave && "opacity-50",
          )}
          disabled={!canSave}
        >
          {updateWorkoutLogPresetMutation.isPending ? (
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
            !canDelete && "opacity-50",
          )}
          disabled={!canDelete}
          onPress={handleDelete}
        >
          {deleteWorkoutLogPresetMutation.isPending ? (
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
  );
}

export default function EditWorkoutLogPreset() {
  const { workoutLogPresetId } = useLocalSearchParams<{
    workoutLogPresetId: string;
  }>();
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const theme = useTheme();

  const { data: workoutLogPreset, isPending } = useQuery({
    queryKey: queryKeys.workoutLogPresets.one(user.id, workoutLogPresetId),
    queryFn: () => getWorkoutLogPreset(workoutLogPresetId),
    initialData: queryClient
      .getQueryData<WorkoutLogPreset[]>(
        queryKeys.workoutLogPresets.all(user.id),
      )
      ?.find((w) => w.id === workoutLogPresetId),
    initialDataUpdatedAt: queryClient.getQueryState(
      queryKeys.workoutLogPresets.all(user.id),
    )?.dataUpdatedAt,
  });

  useEffect(() => {
    if (!isPending && workoutLogPreset === undefined) {
      router.back();
    }
  }, [isPending, workoutLogPreset]);

  if (workoutLogPreset === undefined) {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <ActivityIndicator size="large" color={theme.foreground} />

        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return <WorkoutLogPresetForm workoutLogPreset={workoutLogPreset} />;
}
