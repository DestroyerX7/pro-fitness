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

export const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL!;

type SignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export const getUser = async (userId: string) => {
  const response = await axios.get<User>(
    `${backendUrl}/api/get-user/${userId}`,
  );

  return response.data;
};

export const updateCalorieGoal = async ({
  calorieGoalText,
  userId,
}: {
  calorieGoalText: string;
  userId: string;
}) => {
  const response = await axios.patch<User>(
    `${backendUrl}/api/update-daily-calorie-goal/${userId}`,
    {
      dailyCalorieGoal: Number(calorieGoalText),
    },
  );

  return response.data;
};

export const updateWorkoutGoal = async ({
  workoutGoalText,
  userId,
}: {
  workoutGoalText: string;
  userId: string;
}) => {
  const response = await axios.patch<User>(
    `${backendUrl}/api/update-daily-calorie-goal/${userId}`,
    {
      dailyCalorieGoal: Number(workoutGoalText),
    },
  );

  return response.data;
};

export const createCalorieLog = async ({
  userId,
  name,
  calories,
  consumedAt,
  imageUrl,
}: {
  userId: string;
  name: string;
  calories: number;
  consumedAt?: string;
  imageUrl: string | null;
}) => {
  const response = await axios.post<CalorieLog>(
    `${backendUrl}/api/create-calorie-log`,
    {
      userId,
      name,
      calories,
      consumedAt,
      imageUrl,
    },
  );

  return response.data;
};

export const getCalorieLogs = async (userId: string): Promise<CalorieLog[]> => {
  const response = await axios.get<CalorieLog[]>(
    `${backendUrl}/api/get-calorie-logs/${userId}`,
  );

  return response.data;
};

export const updateCalorieLog = async ({
  calorieLog,
}: {
  calorieLog: CalorieLog;
}) => {
  const response = await axios.put<CalorieLog>(
    `${backendUrl}/api/update-calorie-log/${calorieLog.id}`,
    {
      name: calorieLog.name,
      calories: calorieLog.calories,
      consumedAt: calorieLog.consumedAt,
      imageUrl: calorieLog.imageUrl,
    },
  );

  return response.data;
};

export const deleteCalorieLog = async (calorieLogId: string) => {
  await axios.delete(`${backendUrl}/api/delete-calorie-log/${calorieLogId}`);
};

export const createWorkoutLog = async ({
  userId,
  name,
  duration,
  performedAt,
  iconLibrary,
  iconName,
}: {
  userId: string;
  name: string;
  duration: number;
  performedAt?: string;
  iconLibrary: string;
  iconName: string;
}) => {
  const response = await axios.post<WorkoutLog>(
    `${backendUrl}/api/create-workout-log`,
    {
      userId,
      name,
      duration,
      performedAt,
      iconLibrary,
      iconName,
    },
  );

  return response.data;
};

export const getWorkoutLogs = async (userId: string) => {
  const response = await axios.get<WorkoutLog[]>(
    `${backendUrl}/api/get-workout-logs/${userId}`,
  );

  return response.data;
};

export const updateWorkoutLog = async ({
  workoutLog,
}: {
  workoutLog: WorkoutLog;
}) => {
  const response = await axios.put<WorkoutLog>(
    `${backendUrl}/api/update-workout-log/${workoutLog.id}`,
    {
      name: workoutLog.name,
      duration: workoutLog.duration,
      performedAt: workoutLog.performedAt,
      iconLibrary: workoutLog.iconLibrary,
      iconName: workoutLog.iconName,
    },
  );

  return response.data;
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
  const response = await axios.post<Goal>(`${backendUrl}/api/create-goal`, {
    userId,
    name,
    description,
  });

  return response.data;
};

export const getGoals = async (userId: string) => {
  const response = await axios.get<Goal[]>(
    `${backendUrl}/api/get-goals/${userId}`,
  );

  return response.data;
};

export const updateGoal = async ({ goal }: { goal: Goal }) => {
  const response = await axios.put<Goal>(
    `${backendUrl}/api/update-goal/${goal.id}`,
    {
      name: goal.name,
      description: goal.description,
      completed: goal.completed,
      hidden: goal.hidden,
    },
  );

  return response.data;
};

export const updateGoalCompleted = async ({
  completed,
  goalId,
}: {
  completed: boolean;
  goalId: string;
}) => {
  const response = await axios.patch<Goal>(
    `${backendUrl}/api/update-goal-completed/${goalId}`,
    {
      completed,
    },
  );

  return response.data;
};

export const updateGoalHidden = async ({
  hidden,
  goalId,
}: {
  hidden: boolean;
  goalId: string;
}) => {
  const response = await axios.patch<Goal>(
    `${backendUrl}/api/update-goal-hidden/${goalId}`,
    {
      hidden,
    },
  );

  return response.data;
};

export const deleteGoal = async ({ goalId }: { goalId: string }) => {
  const response = await axios.delete<Goal>(
    `${backendUrl}/api/delete-goal/${goalId}`,
  );

  return response.data;
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
  const response = await axios.get<CalorieLogPreset[]>(
    `${backendUrl}/api/get-calorie-log-presets/${userId}`,
  );

  return response.data;
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
  const response = await axios.get<WorkoutLogPreset[]>(
    `${backendUrl}/api/get-workout-log-presets/${userId}`,
  );

  return response.data;
};

export const uploadToCloudinary = async (imageUri: string) => {
  const signResponse = await axios.post<SignatureResponse>(
    `${backendUrl}/api/sign-cloudinary-upload`,
  );

  const { signature, timestamp, apiKey, cloudName, folder } = signResponse.data;

  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);

  formData.append("signature", signature);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const uploadResponse = await axios.post<{ secure_url: string }>(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
  );

  return uploadResponse.data.secure_url;
};
