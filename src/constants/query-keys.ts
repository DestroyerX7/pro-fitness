export const queryKeys = {
  nutritionLogs: {
    all: (userId: string) => ["nutritionLogs", userId] as const,
    one: (userId: string, id: string) => ["nutritionLogs", userId, id] as const,
  },
  workoutLogs: {
    all: (userId: string) => ["workoutLogs", userId] as const,
    one: (userId: string, id: string) => ["workoutLogs", userId, id] as const,
  },
  goals: {
    all: (userId: string) => ["goals", userId] as const,
    one: (userId: string, id: string) => ["goals", userId, id] as const,
  },
  nutritionLogPresets: {
    all: (userId: string) => ["nutritionLogPresets", userId] as const,
    one: (userId: string, id: string) =>
      ["nutritionLogPresets", userId, id] as const,
  },
  workoutLogPresets: {
    all: (userId: string) => ["workoutLogPresets", userId] as const,
    one: (userId: string, id: string) =>
      ["workoutLogPresets", userId, id] as const,
  },
  dailyTarget: {
    byUser: (userId: string) => ["dailyTarget", userId] as const,
  },
} as const;
