import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import WorkoutIconGrid from "@/components/WorkoutIconGrid";
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

  const updateWorkoutLogMutation = useMutation({
    mutationFn: updateWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", user.id],
      });
    },
  });

  const deleteWorkoutLogPresetMutation = useMutation({
    mutationFn: deleteWorkoutLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workoutLogPresets", user.id],
      });
    },
  });

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
            deleteWorkoutLogPresetMutation.mutate(workoutLogPreset.id, {
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
    const durationMinutesNum = Number(data.durationMinutes);

    // Could maybe use formState.isDirty
    if (
      workoutLogPreset.name === data.name &&
      workoutLogPreset.durationMinutes === durationMinutesNum &&
      workoutLogPreset.icon.library === data.icon.library &&
      workoutLogPreset.icon.name === data.icon.name
    ) {
      return;
    }

    updateWorkoutLogMutation.mutate(
      {
        name: data.name,
        durationMinutes: durationMinutesNum,
        icon: data.icon,
        workoutLogPresetId: workoutLogPreset.id,
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

export default function EditWorkoutLogPreset() {
  const { workoutLogPresetId } = useLocalSearchParams<{
    workoutLogPresetId: string;
  }>();
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const { data: workoutLogPreset, isPending } = useQuery({
    queryKey: ["workoutLogPresets", user.id, workoutLogPresetId],
    queryFn: () => getWorkoutLogPreset(workoutLogPresetId),
    initialData: queryClient
      .getQueryData<WorkoutLogPreset[]>(["workoutLogPresets", user.id])
      ?.find((w) => w.id === workoutLogPresetId),
    initialDataUpdatedAt: queryClient.getQueryState([
      "workoutLogPresets",
      user.id,
    ])?.dataUpdatedAt,
  });

  useEffect(() => {
    if (!isPending && workoutLogPreset === undefined) {
      router.back();
    }
  }, [isPending, workoutLogPreset]);

  if (workoutLogPreset === undefined) {
    return null;
  }

  return <WorkoutLogPresetForm workoutLogPreset={workoutLogPreset} />;
}
