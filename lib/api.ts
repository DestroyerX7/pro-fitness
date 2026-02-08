import {
  calorieLog,
  calorieLogPreset,
  goal,
  user,
  workoutLog,
  workoutLogPreset,
} from "@/db/schema";
import axios from "axios";
export type User = typeof user.$inferSelect;
export type CalorieLog = typeof calorieLog.$inferSelect;
export type WorkoutLog = typeof workoutLog.$inferSelect;
export type Goal = typeof goal.$inferSelect;
export type CalorieLogPreset = typeof calorieLogPreset.$inferSelect;
export type WorkoutLogPreset = typeof workoutLogPreset.$inferSelect;

export const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export const getUser = async (userId: string) => {
  const response = await axios.get<{ user: User }>(
    `${backendUrl}/api/get-user/${userId}`,
  );

  return response.data.user;
};

export const updateCalorieGoal = async ({
  calorieGoalText,
  userId,
}: {
  calorieGoalText: string;
  userId: string;
}) => {
  const response = await axios.patch<{ user: User }>(
    `${backendUrl}/api/update-daily-calorie-goal/${userId}`,
    {
      dailyCalorieGoal: Number(calorieGoalText),
    },
  );

  return response.data.user;
};

export const updateWorkoutGoal = async ({
  workoutGoalText,
  userId,
}: {
  workoutGoalText: string;
  userId: string;
}) => {
  const response = await axios.patch<{ user: User }>(
    `${backendUrl}/api/update-daily-calorie-goal/${userId}`,
    {
      dailyCalorieGoal: Number(workoutGoalText),
    },
  );

  return response.data.user;
};

export const createCalorieLog = async ({
  userId,
  name,
  calories,
  date,
  imageUrl,
}: {
  userId: string;
  name: string;
  calories: number;
  date?: string;
  imageUrl: string | null;
}) => {
  const response = await axios.post<{ calorieLog: CalorieLog }>(
    `${backendUrl}/api/create-calorie-log`,
    {
      userId,
      name,
      calories,
      date,
      imageUrl,
    },
  );

  return response.data.calorieLog;
};

export const getCalorieLogs = async (userId: string) => {
  const response = await axios.get<{ calorieLogs: CalorieLog[] }>(
    `${backendUrl}/api/get-calorie-logs/${userId}`,
  );

  return response.data.calorieLogs;
};

export const updateCalorieLog = async ({
  calorieLog,
}: {
  calorieLog: CalorieLog;
}) => {
  const response = await axios.put<{ calorieLog: CalorieLog }>(
    `${backendUrl}/api/update-calorie-log/${calorieLog.id}`,
    {
      name: calorieLog.name,
      calories: calorieLog.calories,
      date: calorieLog.date,
      imageUrl: calorieLog.imageUrl,
    },
  );

  return response.data.calorieLog;
};

export const deleteCalorieLog = async (calorieLogId: string) => {
  await axios.delete(`${backendUrl}/api/delete-calorie-log/${calorieLogId}`);
};

export const createWorkoutLog = async ({
  userId,
  name,
  duration,
  date,
  iconLibrary,
  iconName,
}: {
  userId: string;
  name: string;
  duration: number;
  date?: string;
  iconLibrary: string;
  iconName: string;
}) => {
  const response = await axios.post<{ workoutLog: WorkoutLog }>(
    `${backendUrl}/api/create-workout-log`,
    {
      userId,
      name,
      duration,
      date,
      iconLibrary,
      iconName,
    },
  );

  return response.data.workoutLog;
};

export const getWorkoutLogs = async (userId: string) => {
  const response = await axios.get<{ workoutLogs: WorkoutLog[] }>(
    `${backendUrl}/api/get-workout-logs/${userId}`,
  );

  return response.data.workoutLogs;
};

export const updateWorkoutLog = async ({
  workoutLog,
}: {
  workoutLog: WorkoutLog;
}) => {
  const response = await axios.put<{ workoutLog: WorkoutLog }>(
    `${backendUrl}/api/update-workout-log/${workoutLog.id}`,
    {
      name: workoutLog.name,
      duration: workoutLog.duration,
      date: workoutLog.date,
      iconLibrary: workoutLog.iconLibrary,
      iconName: workoutLog.iconName,
    },
  );

  return response.data.workoutLog;
};

export const deleteWorkoutLog = async (workoutLogId: string) => {
  await axios.delete(`${backendUrl}/api/delete-workout-log/${workoutLogId}`);
};

export const createGoal = async ({
  userId,
  name,
  description,
}: {
  userId: string;
  name: string;
  description: string;
}) => {
  const response = await axios.post<{ goal: Goal }>(
    `${backendUrl}/api/create-goal`,
    {
      userId,
      name,
      description,
    },
  );

  return response.data.goal;
};

export const getGoals = async (userId: string) => {
  const response = await axios.get<{ goals: Goal[] }>(
    `${backendUrl}/api/get-goals/${userId}`,
  );

  return response.data.goals;
};

export const updateGoal = async ({ goal }: { goal: Goal }) => {
  const response = await axios.put<{ goal: Goal }>(
    `${backendUrl}/api/update-goal/${goal.id}`,
    {
      name: goal.name,
      description: goal.description,
      completed: goal.completed,
      hidden: goal.hidden,
    },
  );

  return response.data.goal;
};

export const updateGoalCompleted = async ({
  completed,
  goalId,
}: {
  completed: boolean;
  goalId: string;
}) => {
  const response = await axios.patch<{ goal: Goal }>(
    `${backendUrl}/api/update-goal-completed/${goalId}`,
    {
      completed,
    },
  );

  return response.data.goal;
};

export const updateGoalHidden = async ({
  hidden,
  goalId,
}: {
  hidden: boolean;
  goalId: string;
}) => {
  const response = await axios.patch<{ goal: Goal }>(
    `${backendUrl}/api/update-goal-hidden/${goalId}`,
    {
      hidden,
    },
  );

  return response.data.goal;
};

export const deleteGoal = async ({ goalId }: { goalId: string }) => {
  const response = await axios.delete<{ goal: Goal }>(
    `${backendUrl}/api/delete-goal/${goalId}`,
  );

  return response.data.goal;
};

export const createCalorieLogPreset = async ({
  userId,
  name,
  calories,
  imageUrl,
}: {
  userId: string;
  name: string;
  calories: number;
  imageUrl: string | null;
}) => {
  await axios.post(`${backendUrl}/api/create-calorie-log-preset`, {
    userId,
    name,
    calories,
    imageUrl,
  });
};

export const getCalorieLogPresets = async (userId: string) => {
  const response = await axios.get<{ calorieLogPresets: CalorieLogPreset[] }>(
    `${backendUrl}/api/get-calorie-log-presets/${userId}`,
  );

  return response.data.calorieLogPresets;
};

export const createWorkoutLogPreset = async ({
  userId,
  name,
  duration,
  iconLibrary,
  iconName,
}: {
  userId: string;
  name: string;
  duration: number;
  iconLibrary: string;
  iconName: string;
}) => {
  await axios.post(`${backendUrl}/api/create-workout-log-preset`, {
    userId,
    name,
    duration,
    iconLibrary,
    iconName,
  });
};

export const getWorkoutLogPresets = async (userId: string) => {
  const response = await axios.get<{ workoutLogPresets: WorkoutLogPreset[] }>(
    `${backendUrl}/api/get-workout-log-presets/${userId}`,
  );

  return response.data.workoutLogPresets;
};
