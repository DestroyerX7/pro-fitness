import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import NutritionLogItem, {
  NutritionLogItemSkeleton,
} from "@/components/NutritionLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import { queryKeys } from "@/constants/query-keys";
import useTheme from "@/hooks/useTheme";
import {
  createNutritionLog,
  createWorkoutLog,
  getNutritionLogPresets,
  getWorkoutLogPresets,
  NutritionLogPreset,
  WorkoutLogPreset,
} from "@/lib/api";
import { toSqlTimestamp } from "@/lib/dates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Preset() {
  const queryClient = useQueryClient();
  const { user } = useAuthenticatedAuth();

  const [activeTab, setActiveTab] = useState<"nutrition" | "workout">(
    "nutrition",
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const {
    data: nutritionLogPresets,
    isPending: isPendingNutritionLogPresets,
    error: nutritionLogsError,
    refetch: refetchNutritionLogs,
  } = useQuery({
    queryKey: queryKeys.nutritionLogPresets.all(user.id),
    queryFn: getNutritionLogPresets,
  });

  const {
    data: workoutLogPresets,
    isPending: isPendingWorkoutLogPresets,
    error: workoutLogsError,
    refetch: refetchWorkoutLogs,
  } = useQuery({
    queryKey: queryKeys.workoutLogPresets.all(user.id),
    queryFn: getWorkoutLogPresets,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const createNutritionLogMutation = useMutation({
    mutationFn: createNutritionLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.nutritionLogs.all(user.id),
      });

      Toast.show({
        type: "loggedCalories",
        text1: "Logged!",
        text2: `${data.name} • ${data.calories} cal`,
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

  const createWorkoutLogMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutLogs.all(user.id),
      });

      Toast.show({
        type: "loggedWorkout",
        text1: "Logged!",
        text2: `${data.name} • ${data.durationMinutes} mins`,
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

  const logCalories = async (nutritionLogPreset: NutritionLogPreset) => {
    const consumedAtSqlTimestamp = toSqlTimestamp(new Date());

    createNutritionLogMutation.mutate({
      userId: user.id,
      name: nutritionLogPreset.name,
      calories: nutritionLogPreset.calories,
      imageUrl: nutritionLogPreset.imageUrl,
      consumedAt: consumedAtSqlTimestamp,
    });
  };

  const logWorkout = async (workoutLogPreset: WorkoutLogPreset) => {
    const performedAtSqlTimestamp = toSqlTimestamp(new Date());

    createWorkoutLogMutation.mutate({
      userId: user.id,
      name: workoutLogPreset.name,
      durationMinutes: workoutLogPreset.durationMinutes,
      performedAt: performedAtSqlTimestamp,
      icon: workoutLogPreset.icon,
    });
  };

  const handleEditNutritionLogPreset = async (nutritionLogPresetId: string) => {
    router.push({
      pathname: "/(protected)/edit/nutrition-log-preset/[nutritionLogPresetId]",
      params: { nutritionLogPresetId },
    });

    await Haptics.selectionAsync();
  };

  const handleEditWorkoutLogPreset = async (workoutLogPresetId: string) => {
    router.push({
      pathname: "/edit/workout-log-preset/[workoutLogPresetId]",
      params: { workoutLogPresetId },
    });

    await Haptics.selectionAsync();
  };

  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      await Promise.allSettled([refetchNutritionLogs(), refetchWorkoutLogs()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isPendingNutritionLogPresets || isPendingWorkoutLogPresets) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 flex-1"
        >
          <TabButton disabled text="Calories" active={true} />

          <TabButton disabled text="Workouts" active={false} />
        </ScrollView>

        {Array.from({ length: 10 }).map((_, i) => (
          <NutritionLogItemSkeleton key={i} />
        ))}
      </ScrollView>
    );
  }

  if (nutritionLogsError !== null || workoutLogsError !== null) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="gap-4 items-center p-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Something went wrong loading your data.
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl"
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <ThemedText className="text-secondary-foreground">
              {isRefreshing ? "Retrying..." : "Try again"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 flex-1"
      >
        <TabButton
          text="Calories"
          active={activeTab === "nutrition"}
          onPress={() => setActiveTab("nutrition")}
        />

        <TabButton
          text="Workouts"
          active={activeTab === "workout"}
          onPress={() => setActiveTab("workout")}
        />
      </ScrollView>

      {activeTab === "nutrition" ? (
        nutritionLogPresets.length > 0 ? (
          nutritionLogPresets.map((nutritionLogPreset) => (
            <Pressable
              className="active:opacity-80"
              key={nutritionLogPreset.id}
              onPress={() => logCalories(nutritionLogPreset)}
              onLongPress={() =>
                handleEditNutritionLogPreset(nutritionLogPreset.id)
              }
            >
              <NutritionLogItem
                name={nutritionLogPreset.name}
                imageUrl={nutritionLogPreset.imageUrl}
                calories={nutritionLogPreset.calories}
              />
            </Pressable>
          ))
        ) : (
          <View className="p-4 border border-border rounded-xl items-center">
            <MaterialCommunityIcons
              name="tune"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-2xl font-bold">
              No saved calorie presets
            </ThemedText>

            <ThemedText className="text-muted-foreground text-center">
              Edit a calorie log and press create preset based off it&apos;s
              values
            </ThemedText>
          </View>
        )
      ) : workoutLogPresets.length > 0 ? (
        workoutLogPresets.map((workoutLogPreset) => (
          <Pressable
            className="active:opacity-80"
            onPress={() => logWorkout(workoutLogPreset)}
            onLongPress={() => handleEditWorkoutLogPreset(workoutLogPreset.id)}
            key={workoutLogPreset.id}
          >
            <WorkoutLogItem
              name={workoutLogPreset.name}
              durationMinutes={workoutLogPreset.durationMinutes}
              workoutLogIcon={workoutLogPreset.icon}
            />
          </Pressable>
        ))
      ) : (
        <View className="p-4 border border-border rounded-xl items-center">
          <MaterialCommunityIcons
            name="tune"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-2xl font-bold">
            No saved workout presets
          </ThemedText>

          <ThemedText className="text-muted-foreground text-center">
            Edit a workout log and press create preset based off it&apos;s
            values
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
