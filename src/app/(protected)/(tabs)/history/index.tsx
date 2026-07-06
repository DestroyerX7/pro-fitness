import { useAuthenticatedAuth } from "@/components/AuthenticatedAuthProvider";
import GoalItem from "@/components/GoalItem";
import NutritionLogItem from "@/components/NutritionLogItem";
import TabButton from "@/components/TabButton";
import ThemedText from "@/components/ThemedText";
import WorkoutLogItem from "@/components/WorkoutLogItem";
import useDailyTarget from "@/hooks/useDailyTarget";
import useGoals from "@/hooks/useGoals";
import useNutritionLogs from "@/hooks/useNutritionLogs";
import useTheme from "@/hooks/useTheme";
import useWorkoutLogs from "@/hooks/useWorkoutLogs";
import { Goal, NutritionLog, WorkoutLog } from "@/lib/api";
import { toSqlDate } from "@/lib/dates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  View,
} from "react-native";

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return toSqlDate(a) === toSqlDate(b);
}

function formatSectionTitle(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type CalendarItem = CalendarDateItem | null;

type CalendarDateItem = {
  date: Date;
  percentComplete: number;
};

function CalendarDateItemDisplay({
  calendarDateItem,
  backgroundColor,
  borderColor,
  textColor,
}: {
  calendarDateItem: CalendarDateItem;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}) {
  return (
    <View
      className={
        "flex-1 aspect-square rounded-xl items-center justify-center border"
      }
      style={{ backgroundColor, borderColor }}
    >
      <ThemedText style={{ color: textColor }}>
        {calendarDateItem.date.getDate()}
      </ThemedText>

      {calendarDateItem.percentComplete !== 0 && (
        <ThemedText className="text-xs" style={{ color: textColor }}>
          {calendarDateItem.percentComplete.toFixed(0)}%
        </ThemedText>
      )}
    </View>
  );
}

function Tabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: "nutrition" | "workout" | "goal";
  setActiveTab: (tab: "nutrition" | "workout" | "goal") => void;
}) {
  return (
    <ScrollView horizontal contentContainerClassName="gap-2">
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

      <TabButton
        text="Goals"
        active={activeTab === "goal"}
        onPress={() => setActiveTab("goal")}
      />
    </ScrollView>
  );
}

function buildCalendarItemRows(
  year: number,
  month: number,
  numDaysInMonth: number,
  leadingPadding: number,
  trailingPadding: number,
  getPercentComplete: (dateString: string) => number,
): CalendarItem[][] {
  const items = [
    ...Array(leadingPadding).fill(null),
    ...Array.from({ length: numDaysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateString = toSqlDate(date);
      return { date, percentComplete: getPercentComplete(dateString) };
    }),
    ...Array(trailingPadding).fill(null),
  ];

  return chunk(items, 7);
}

export default function History() {
  const { user } = useAuthenticatedAuth();
  const {
    data: dailyTarget,
    refetch: refetchDailyTarget,
    isPending: isPendingDailyTarget,
    error: dailyTargetError,
  } = useDailyTarget(user.id);
  const {
    data: nutritionLogs,
    refetch: refetchNutritionLogs,
    isPending: isPendingNutritionLogs,
    error: nutritionLogsError,
  } = useNutritionLogs(user.id);
  const {
    data: workoutLogs,
    refetch: refetchWorkoutLogs,
    isPending: isPendingWorkoutLogs,
    error: workoutLogsError,
  } = useWorkoutLogs(user.id);
  const {
    data: goals,
    refetch: refetchGoals,
    isPending: isPendingGoals,
    error: goalsError,
  } = useGoals(user.id);

  const [activeTab, setActiveTab] = useState<"nutrition" | "workout" | "goal">(
    "nutrition",
  );

  const theme = useTheme();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (refreshEverything: boolean = false) => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);

    try {
      const promises = refreshEverything
        ? [
            refetchNutritionLogs(),
            refetchNutritionLogs(),
            refetchGoals(),
            refetchDailyTarget(),
          ]
        : activeTab === "nutrition"
          ? [refetchNutritionLogs(), refetchDailyTarget()]
          : activeTab === "workout"
            ? [refetchWorkoutLogs(), refetchDailyTarget()]
            : [refetchGoals()];

      await Promise.allSettled(promises);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (
    dailyTargetError !== null ||
    nutritionLogsError !== null ||
    workoutLogsError !== null ||
    goalsError !== null
  ) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => handleRefresh(true)}
          />
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
            onPress={() => handleRefresh(true)}
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

  if (
    isPendingDailyTarget ||
    isPendingNutritionLogs ||
    isPendingWorkoutLogs ||
    isPendingGoals
  ) {
    return <ThemedText>Loding...</ThemedText>;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const numDaysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingCalendarPadding = new Date(year, month, 1).getDay();
  const trailingCalendarPadding =
    (7 - ((leadingCalendarPadding + numDaysInMonth) % 7)) % 7;

  const nutritionLogsGroupedByConsumedAt = nutritionLogs.reduce<
    Record<
      string,
      {
        nutritionLogs: NutritionLog[];
        totalCalories: number;
        date: Date;
      }
    >
  >((a, b) => {
    const key = toSqlDate(b.consumedAt);

    if (a[key] !== undefined) {
      a[key].nutritionLogs.push(b);
      a[key].totalCalories += b.calories;
    } else {
      a[key] = {
        nutritionLogs: [b],
        totalCalories: b.calories,
        date: new Date(
          b.consumedAt.getFullYear(),
          b.consumedAt.getMonth(),
          b.consumedAt.getDate(),
        ),
      };
    }

    return a;
  }, {});

  const workoutLogsGroupedByPerformedAt = workoutLogs.reduce<
    Record<
      string,
      {
        workoutLogs: WorkoutLog[];
        totalDurationMinutes: number;
        date: Date;
      }
    >
  >((a, b) => {
    const key = toSqlDate(b.performedAt);

    if (a[key] !== undefined) {
      a[key].workoutLogs.push(b);
      a[key].totalDurationMinutes += b.durationMinutes;
    } else {
      a[key] = {
        workoutLogs: [b],
        totalDurationMinutes: b.durationMinutes,
        date: new Date(
          b.performedAt.getFullYear(),
          b.performedAt.getMonth(),
          b.performedAt.getDate(),
        ),
      };
    }

    return a;
  }, {});

  const goalsGroupedByCreatedAt = goals.reduce<
    Record<
      string,
      {
        goals: Goal[];
        date: Date;
      }
    >
  >((a, b) => {
    const key = toSqlDate(b.createdAt);

    if (a[key] !== undefined) {
      a[key].goals.push(b);
    } else {
      a[key] = {
        goals: [b],
        date: new Date(
          b.createdAt.getFullYear(),
          b.createdAt.getMonth(),
          b.createdAt.getDate(),
        ),
      };
    }

    return a;
  }, {});

  const nutritionLogCalendarItemRows = buildCalendarItemRows(
    year,
    month,
    numDaysInMonth,
    leadingCalendarPadding,
    trailingCalendarPadding,
    (dateString) =>
      dailyTarget !== undefined
        ? ((nutritionLogsGroupedByConsumedAt[dateString]?.totalCalories ?? 0) /
            dailyTarget.calorieTarget) *
          100
        : 0,
  );

  const workoutLogCalendarItemRows = buildCalendarItemRows(
    year,
    month,
    numDaysInMonth,
    leadingCalendarPadding,
    trailingCalendarPadding,
    (dateString) =>
      dailyTarget !== undefined
        ? ((workoutLogsGroupedByPerformedAt[dateString]?.totalDurationMinutes ??
            0) /
            dailyTarget.workoutMinutesTarget) *
          100
        : 0,
  );

  if (activeTab === "nutrition") {
    return (
      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-4 mb-4">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <View className="gap-1">
              <View className="flex-row gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((dayString, i) => (
                  <View key={i} className="flex-1">
                    <ThemedText className="text-center">{dayString}</ThemedText>
                  </View>
                ))}
              </View>

              {nutritionLogCalendarItemRows.map((week, i) => (
                <View key={i} className="flex-row gap-1">
                  {week.map((calendarItem, j) => {
                    if (calendarItem === null) {
                      return (
                        <View
                          key={j}
                          className="flex-1 aspect-square bg-muted rounded-xl"
                        />
                      );
                    }

                    const borderColor = isSameDay(today, calendarItem.date)
                      ? theme.secondaryForeground
                      : "transparent";

                    const backgroundColor =
                      calendarItem.percentComplete >= 100
                        ? theme.nutritionOne
                        : calendarItem.percentComplete >= 50
                          ? theme.nutritionTwo
                          : calendarItem.percentComplete > 0
                            ? theme.nutritionFour
                            : theme.secondary;

                    return (
                      <CalendarDateItemDisplay
                        key={j}
                        calendarDateItem={calendarItem}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                        textColor={theme.foreground}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        }
        sections={Object.values(nutritionLogsGroupedByConsumedAt).map(
          (data) => ({
            title: formatSectionTitle(data.date),
            data: data.nutritionLogs,
            totalCalories: data.totalCalories,
          }),
        )}
        renderSectionHeader={({ section }) => (
          <View className="flex-row justify-between">
            <ThemedText>{section.title}</ThemedText>

            <ThemedText>{section.totalCalories} calories</ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <NutritionLogItem
            name={item.name}
            calories={item.calories}
            consumedAt={item.consumedAt}
          />
        )}
        ListEmptyComponent={
          <View className="gap-4 items-center p-4">
            <MaterialCommunityIcons
              name="food"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-center text-xl w-3/4">
              Your calorie logs will appear here, showing the things you have
              logged.
            </ThemedText>

            <Pressable
              className="bg-secondary p-4 rounded-xl active:opacity-80"
              onPress={() => router.push("/(protected)/(tabs)/log/nutrition")}
            >
              <ThemedText className="text-secondary-foreground">
                Log calories
              </ThemedText>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        SectionSeparatorComponent={() => <View className="h-4" />}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    );
  } else if (activeTab === "workout") {
    return (
      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-4 mb-4">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <View className="gap-1">
              <View className="flex-row gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((dayString, i) => (
                  <View key={i} className="flex-1">
                    <ThemedText className="text-center">{dayString}</ThemedText>
                  </View>
                ))}
              </View>

              {workoutLogCalendarItemRows.map((week, i) => (
                <View key={i} className="flex-row gap-1">
                  {week.map((calendarItem, j) => {
                    if (calendarItem === null) {
                      return (
                        <View
                          key={j}
                          className="flex-1 aspect-square bg-muted rounded-xl"
                        />
                      );
                    }

                    const borderColor = isSameDay(today, calendarItem.date)
                      ? theme.secondaryForeground
                      : "transparent";

                    const backgroundColor =
                      calendarItem.percentComplete >= 100
                        ? theme.chartOne
                        : calendarItem.percentComplete >= 50
                          ? theme.chartTwo
                          : calendarItem.percentComplete > 0
                            ? theme.chartFour
                            : theme.secondary;

                    return (
                      <CalendarDateItemDisplay
                        key={j}
                        calendarDateItem={calendarItem}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                        textColor={theme.foreground}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        }
        sections={Object.values(workoutLogsGroupedByPerformedAt).map(
          (data) => ({
            title: formatSectionTitle(data.date),
            data: data.workoutLogs,
            totalDurationMinutes: data.totalDurationMinutes,
          }),
        )}
        renderSectionHeader={({ section }) => (
          <View className="flex-row justify-between">
            <ThemedText>{section.title}</ThemedText>

            <ThemedText>{section.totalDurationMinutes} minutes</ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <WorkoutLogItem {...item} workoutLogIcon={item.icon} />
        )}
        ListEmptyComponent={
          <View className="gap-4 items-center p-4">
            <MaterialCommunityIcons
              name="run"
              size={64}
              color={theme.foreground}
            />

            <ThemedText className="text-center text-xl w-3/4">
              Your workout logs will appear here, showing the things you have
              logged.
            </ThemedText>

            <Pressable
              className="bg-secondary p-4 rounded-xl active:opacity-80"
              onPress={() => router.push("/(protected)/(tabs)/log/workout")}
            >
              <ThemedText className="text-secondary-foreground">
                Log workout
              </ThemedText>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        SectionSeparatorComponent={() => <View className="h-4" />}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <SectionList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="mb-4">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      }
      sections={Object.values(goalsGroupedByCreatedAt).map((data) => ({
        title: formatSectionTitle(data.date),
        data: data.goals,
        totalCreated: data.goals.length,
      }))}
      renderSectionHeader={({ section }) => (
        <View className="flex-row justify-between">
          <ThemedText>{section.title}</ThemedText>

          <ThemedText>{section.totalCreated} created</ThemedText>
        </View>
      )}
      renderItem={({ item }) => (
        <GoalItem
          name={item.name}
          completed={item.completed}
          description={item.description}
        />
      )}
      ListEmptyComponent={
        <View className="gap-4 items-center p-4">
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={64}
            color={theme.foreground}
          />

          <ThemedText className="text-center text-xl w-3/4">
            Your goals will appear here, showing everything you have created.
          </ThemedText>

          <Pressable
            className="bg-secondary p-4 rounded-xl active:opacity-80"
            onPress={() => router.push("/(protected)/(tabs)/log/goal")}
          >
            <ThemedText className="text-secondary-foreground">
              Create Goal
            </ThemedText>
          </Pressable>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-4" />}
      SectionSeparatorComponent={() => <View className="h-4" />}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  );
}
