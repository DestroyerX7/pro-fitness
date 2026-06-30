import { useAuth } from "@/components/AuthProvider";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import {
  CalorieLog,
  createCalorieLogPreset,
  deleteCalorieLog,
  updateCalorieLog,
} from "@/lib/api";
import { fromSqlTimestampToLocalDate, toSqlTimestamp } from "@/lib/dates";
import { cn } from "@/lib/utils";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DraftCalorieLog = {
  name: string;
  calories: string;
  consumedAt: Date;
};

function validateDraft(draft: DraftCalorieLog) {
  const name = draft.name.trim();
  const calories = Number(draft.calories.trim());

  const errors: { name?: string; calories?: string } = {};

  if (name.length < 1) {
    errors.name = "Name is required.";
  }

  if (!Number.isFinite(calories) || calories < 1) {
    errors.calories = "Enter a calorie amount greater than 0.";
  }

  return { name, calories, errors, isValid: Object.keys(errors).length === 0 };
}

function CalorieLogForm({
  calorieLog,
  draft,
  errors,
  onDraftChanged,
}: {
  calorieLog: CalorieLog;
  draft: DraftCalorieLog;
  errors: { name?: string; calories?: string };
  onDraftChanged: (draft: DraftCalorieLog) => void;
}) {
  const theme = useTheme();

  return (
    <View className="gap-4">
      <View className="gap-1">
        <ThemedText className="font-bold">Name</ThemedText>

        <ThemedTextInput
          placeholder="Name"
          value={draft.name}
          onChangeText={(text) => onDraftChanged({ ...draft, name: text })}
        />

        {errors.name ? (
          <ThemedText className="text-destructive text-sm">
            {errors.name}
          </ThemedText>
        ) : null}
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Calories</ThemedText>

        <ThemedTextInput
          placeholder="Calories"
          value={draft.calories}
          onChangeText={(text) => onDraftChanged({ ...draft, calories: text })}
          keyboardType="number-pad"
        />

        {errors.calories ? (
          <ThemedText className="text-destructive text-sm">
            {errors.calories}
          </ThemedText>
        ) : null}
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Consumed At</ThemedText>

        <View className="text-foreground py-4 border border-border rounded-xl bg-muted">
          <DateTimePicker
            value={draft.consumedAt}
            mode="datetime"
            onValueChange={(_, selectedDate) =>
              onDraftChanged({ ...draft, consumedAt: selectedDate })
            }
          />
        </View>
      </View>

      <View className="gap-1">
        <ThemedText className="font-bold">Image</ThemedText>

        <View className="aspect-square">
          {calorieLog.imageUrl !== null ? (
            <Image
              source={{ uri: calorieLog.imageUrl }}
              style={{ flex: 1, borderRadius: 16 }}
            />
          ) : (
            <View className="flex-1 border rounded-xl border-border items-center justify-center bg-muted">
              <MaterialCommunityIcons
                name="food"
                size={256}
                color={theme.foreground}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function Screen() {
  const { calorieLogId } = useLocalSearchParams<{ calorieLogId: string }>();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const calorieLog =
    authData !== null
      ? queryClient
          .getQueryData<CalorieLog[]>(["calorieLogs", authData.user.id])
          ?.find((c) => c.id === calorieLogId)
      : undefined;

  const [draft, setDraft] = useState<DraftCalorieLog | null>(
    calorieLog !== undefined
      ? {
          name: calorieLog.name,
          calories: calorieLog.calories.toString(),
          consumedAt: fromSqlTimestampToLocalDate(calorieLog.consumedAt),
        }
      : null,
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateCalorieLogMutation = useMutation({
    mutationFn: updateCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const deleteCalorieLogMutation = useMutation({
    mutationFn: deleteCalorieLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogs", authData?.user.id],
      });
    },
  });

  const createCalorieLogPresetMutation = useMutation({
    mutationFn: createCalorieLogPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calorieLogPresets", calorieLog?.userId],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Bail out of the screen if there's nothing to edit (e.g. stale cache,
  // deep link to a deleted log). Doing this in an effect rather than during
  // render avoids triggering a navigation side effect mid-render.
  useEffect(() => {
    if (authData === null || calorieLog === undefined) {
      router.back();
    }
  }, [authData, calorieLog]);

  if (calorieLog === undefined || draft === null) {
    return null;
  }

  const { errors } = validateDraft(draft);

  const handleDraftChanged = (next: DraftCalorieLog) => {
    setDraft(next);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const { name, calories, isValid } = validateDraft(draft);

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const consumedAtString = toSqlTimestamp(draft.consumedAt);

    const editedCalorieLog: CalorieLog = {
      ...calorieLog,
      name,
      calories,
      consumedAt: consumedAtString,
    };

    updateCalorieLogMutation.mutate(
      {
        name: editedCalorieLog.name,
        calories: editedCalorieLog.calories,
        consumedAt: editedCalorieLog.consumedAt,
        imageUrl: editedCalorieLog.imageUrl,
        calorieLogId: editedCalorieLog.id,
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

  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      router.back();
      return;
    }

    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. Are you sure you want to discard them?",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  const handleDelete = async () => {
    await Haptics.selectionAsync();

    Alert.alert(
      `Delete ${calorieLog.name}`,
      "Are you sure you want to delete this calorie log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCalorieLogMutation.mutate(calorieLogId, {
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

  const handleCreateCalorieLogPreset = () => {
    createCalorieLogPresetMutation.mutate({
      userId: calorieLog.userId,
      name: calorieLog.name,
      calories: calorieLog.calories,
      imageUrl: calorieLog.imageUrl,
    });
  };

  const isSaving = updateCalorieLogMutation.isPending;
  const isDeleting = deleteCalorieLogMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              className="p-2 justify-center items-center flex-row gap-2"
              disabled={createCalorieLogPresetMutation.isPending}
              onPress={handleCreateCalorieLogPreset}
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

      <View className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName="p-4"
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            <CalorieLogForm
              calorieLog={calorieLog}
              draft={draft}
              errors={errors}
              onDraftChanged={handleDraftChanged}
            />
          </ScrollView>

          <View
            collapsable={false}
            className="flex-row gap-4 p-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Pressable
              className="bg-destructive-accent p-4 rounded-xl items-center justify-center"
              disabled={isDeleting}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="trash-can"
                size={24}
                color={theme.destructive}
              />
            </Pressable>

            <Pressable
              className="bg-border p-4 rounded-xl flex-1 items-center justify-center"
              onPress={handleCancel}
            >
              <ThemedText>Cancel</ThemedText>
            </Pressable>

            <Pressable
              className={cn(
                "bg-primary p-4 rounded-xl flex-1 items-center justify-center",
                isSaving || !hasUnsavedChanges ? "opacity-50" : "",
              )}
              disabled={isSaving || !hasUnsavedChanges}
              onPress={handleSave}
            >
              <ThemedText className="text-primary-foreground">
                {isSaving ? "Saving..." : "Save"}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
