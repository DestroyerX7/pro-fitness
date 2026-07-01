import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
import useTheme from "@/hooks/useTheme";
import {
  deleteWorkoutLogPreset,
  updateWorkoutLogPreset,
  WorkoutLogPreset,
} from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  WorkoutLogPresetFormValues,
  workoutLogPresetSchema,
} from "@/lib/zodSchema";
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

export default function EditWorkoutLogPreset() {
  const { workoutLogPresetId } = useLocalSearchParams<{
    workoutLogPresetId: string;
  }>();
  const queryClient = useQueryClient();
  const { data: authData } = authClient.useSession();

  const workoutLogPreset =
    authData !== null
      ? queryClient
          .getQueryData<WorkoutLogPreset[]>([
            "workoutLogPresets",
            authData.user.id,
          ])
          ?.find((c) => c.id === workoutLogPresetId)
      : undefined;

  const { control, handleSubmit, formState, setValue } =
    useForm<WorkoutLogPresetFormValues>({
      resolver: zodResolver(workoutLogPresetSchema),
      defaultValues: {
        name: workoutLogPreset !== undefined ? workoutLogPreset.name : "",
        duration:
          workoutLogPreset !== undefined
            ? workoutLogPreset.duration.toString()
            : "",
        icon:
          workoutLogPreset !== undefined
            ? workoutLogPreset.icon
            : {
                library: "MaterialCommunityIcons",
                name: "run",
              },
      },
    });

  const theme = useTheme();

  const updateWorkoutLogMutation = useMutation({
    mutationFn: updateWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", authData?.user.id],
      });
    },
  });

  const deleteWorkoutLogPresetMutation = useMutation({
    mutationFn: deleteWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", authData?.user.id],
      });
    },
  });

  // Bail out of the screen if there's nothing to edit (e.g. stale cache,
  // deep link to a deleted log). Doing this in an effect rather than during
  // render avoids triggering a navigation side effect mid-render.
  useEffect(() => {
    if (authData === null || workoutLogPreset === undefined) {
      router.back();
    }
  }, [authData, workoutLogPreset]);

  if (workoutLogPreset === undefined) {
    return null;
  }

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${workoutLogPreset.name}`,
      "Are you sure you want to delete this workout log preset?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteWorkoutLogPresetMutation.mutate(workoutLogPresetId, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  "Couldn't delete",
                  "Something went wrong while deleting this preset. Please try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const onSubmit = async (data: WorkoutLogPresetFormValues) => {
    const durationNum = Number(data.duration);

    // Could maybe use formState.isDirty
    if (
      workoutLogPreset.name === data.name &&
      workoutLogPreset.duration === durationNum &&
      workoutLogPreset.icon.library === data.icon.library &&
      workoutLogPreset.icon.name === data.icon.name
    ) {
      return;
    }

    updateWorkoutLogMutation.mutate(
      {
        name: data.name,
        duration: durationNum,
        icon: data.icon,
        workoutLogPresetId,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Couldn't save",
            "Something went wrong while saving this preset. Please try again.",
          ),
      },
    );
  };

  const isSaving = formState.isSubmitting || updateWorkoutLogMutation.isPending;
  const isDeleting = deleteWorkoutLogPresetMutation.isPending;
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
  );
}
