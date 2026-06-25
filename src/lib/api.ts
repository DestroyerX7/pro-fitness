import {
  calorieLog,
  calorieLogPreset,
  goal,
  user,
  workoutLog,
  workoutLogPreset,
} from "@/db/schema";
import axios from "axios";
import { authClient } from "./auth-client";

export type User = typeof user.$inferSelect;
export type CalorieLog = typeof calorieLog.$inferSelect;
export type WorkoutLog = typeof workoutLog.$inferSelect;
export type Goal = typeof goal.$inferSelect;
export type CalorieLogPreset = typeof calorieLogPreset.$inferSelect;
export type WorkoutLogPreset = typeof workoutLogPreset.$inferSelect;

type CloudinarySignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL!,
});

api.interceptors.request.use((config) => {
  const cookie = authClient.getCookie();

  if (cookie.length > 0) {
    config.headers.Cookie = cookie;
  }

  return config;
});

export const getUser = async (userId: string) => {
  const response = await api.get<User>(`/api/get-user/${userId}`);
  return response.data;
};

export const updateUser = async ({
  dailyCalorieGoal,
  dailyWorkoutGoal,
  userId,
}: {
  dailyCalorieGoal?: number;
  dailyWorkoutGoal?: number;
  userId: string;
}) => {
  const response = await api.patch<User>(`/api/update-user/${userId}`, {
    dailyCalorieGoal,
    dailyWorkoutGoal,
  });

  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.get<User>(`/api/delete-user/${userId}`);
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
  imageUrl?: string | null | undefined;
}) => {
  const response = await api.post<CalorieLog>("/api/create-calorie-log", {
    userId,
    name,
    calories,
    consumedAt,
    imageUrl,
  });

  return response.data;
};

export const getCalorieLogs = async (userId: string): Promise<CalorieLog[]> => {
  const response = await api.get<CalorieLog[]>(
    `/api/get-calorie-logs/${userId}`,
  );

  return response.data;
};

export const updateCalorieLog = async ({
  name,
  calories,
  consumedAt,
  imageUrl,
  calorieLogId,
}: {
  name?: string;
  calories?: number;
  consumedAt?: string;
  imageUrl?: string | null | undefined;
  calorieLogId: string;
}) => {
  const response = await api.patch<CalorieLog>(
    `/api/update-calorie-log/${calorieLogId}`,
    {
      name,
      calories,
      consumedAt,
      imageUrl,
    },
  );

  return response.data;
};

export const deleteCalorieLog = async (calorieLogId: string) => {
  const response = await api.delete<CalorieLog>(
    `/api/delete-calorie-log/${calorieLogId}`,
  );

  return response.data;
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
  const response = await api.post<WorkoutLog>("/api/create-workout-log", {
    userId,
    name,
    duration,
    performedAt,
    iconLibrary,
    iconName,
  });

  return response.data;
};

export const getWorkoutLogs = async (userId: string) => {
  const response = await api.get<WorkoutLog[]>(
    `/api/get-workout-logs/${userId}`,
  );

  return response.data;
};

export const updateWorkoutLog = async ({
  name,
  duration,
  performedAt,
  iconLibrary,
  iconName,
  workoutLogId,
}: {
  name?: string;
  duration?: number;
  performedAt?: string;
  iconLibrary?: string;
  iconName?: string;
  workoutLogId: string;
}) => {
  const response = await api.patch<WorkoutLog>(
    `/api/update-workout-log/${workoutLogId}`,
    {
      name,
      duration,
      performedAt,
      iconLibrary,
      iconName,
    },
  );

  return response.data;
};

export const deleteWorkoutLog = async (workoutLogId: string) => {
  const response = await api.delete<WorkoutLog>(
    `/api/delete-workout-log/${workoutLogId}`,
  );

  return response.data;
};

export const createGoal = async ({
  userId,
  name,
  description,
}: {
  userId: string;
  name: string;
  description?: string;
}) => {
  const response = await api.post<Goal>("/api/create-goal", {
    userId,
    name,
    description,
  });

  return response.data;
};

export const getGoals = async (userId: string) => {
  const response = await api.get<Goal[]>(`/api/get-goals/${userId}`);
  return response.data;
};

export const updateGoal = async ({
  name,
  description,
  completed,
  hidden,
  goalId,
}: {
  name?: string;
  description?: string;
  completed?: boolean;
  hidden?: boolean;
  goalId: string;
}) => {
  const response = await api.patch<Goal>(`/api/update-goal/${goalId}`, {
    name,
    description,
    completed,
    hidden,
  });

  return response.data;
};

export const deleteGoal = async ({ goalId }: { goalId: string }) => {
  const response = await api.delete<Goal>(`/api/delete-goal/${goalId}`);
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
  imageUrl?: string | null | undefined;
}) => {
  const response = await api.post<CalorieLogPreset>(
    "/api/create-calorie-log-preset",
    {
      userId,
      name,
      calories,
      imageUrl,
    },
  );

  return response.data;
};

export const getCalorieLogPresets = async (userId: string) => {
  const response = await api.get<CalorieLogPreset[]>(
    `/api/get-calorie-log-presets/${userId}`,
  );

  return response.data;
};

export const updateCalorieLogPreset = async ({
  name,
  calories,
  imageUrl,
  calorieLogId,
}: {
  name?: string;
  calories?: number;
  imageUrl?: string | null | undefined;
  calorieLogId: string;
}) => {
  const response = await api.patch<CalorieLogPreset>(
    `/api/update-calorie-log-preset/${calorieLogId}`,
    {
      name,
      calories,
      imageUrl,
    },
  );

  return response.data;
};

export const deleteCalorieLogPreset = async ({
  calorieLogId,
}: {
  calorieLogId: string;
}) => {
  const response = await api.delete<CalorieLogPreset>(
    `/api/delete-calorie-log-preset/${calorieLogId}`,
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
  const response = await api.post(`/api/create-workout-log-preset`, {
    userId,
    name,
    duration,
    iconLibrary,
    iconName,
  });

  return response.data;
};

export const getWorkoutLogPresets = async (userId: string) => {
  const response = await api.get<WorkoutLogPreset[]>(
    `/api/get-workout-log-presets/${userId}`,
  );

  return response.data;
};

export const updateWorkoutLogPreset = async ({
  name,
  duration,
  performedAt,
  iconLibrary,
  iconName,
  workoutLogPresetId,
}: {
  name?: string;
  duration?: number;
  performedAt?: string;
  iconLibrary?: string;
  iconName?: string;
  workoutLogPresetId: string;
}) => {
  const response = await api.patch<WorkoutLog>(
    `/api/update-workout-log-preset/${workoutLogPresetId}`,
    {
      name,
      duration,
      performedAt,
      iconLibrary,
      iconName,
    },
  );

  return response.data;
};

export const deleteWorkoutLogPreset = async ({
  workoutLogId,
}: {
  workoutLogId: string;
}) => {
  const response = await api.delete<WorkoutLogPreset>(
    `/api/delete-workout-log-preset/${workoutLogId}`,
  );

  return response.data;
};

export const uploadToCloudinary = async (imageUri: string) => {
  const signResponse = await api.post<CloudinarySignatureResponse>(
    `/api/sign-cloudinary-upload`,
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
