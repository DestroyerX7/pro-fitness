import { WorkoutLogIcon } from "@/components/WorkoutLogIconDisplay";
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

// eslint-disable-next-line import/no-named-as-default-member
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

export const getUser = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/api/user/${userId}`);
  return response.data;
};

export const updateUser = async ({
  dailyCalorieGoal,
  dailyWorkoutGoal,
  image,
  userId,
}: {
  dailyCalorieGoal?: number;
  dailyWorkoutGoal?: number;
  image?: string | null | undefined;
  userId: string;
}): Promise<User> => {
  const response = await api.patch<User>(`/api/user/${userId}`, {
    dailyCalorieGoal,
    dailyWorkoutGoal,
    image,
  });

  return response.data;
};

export const deleteUser = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/api/user/${userId}`);
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
}): Promise<CalorieLog> => {
  const response = await api.post<CalorieLog>("/api/calorie-logs", {
    userId,
    name,
    calories,
    consumedAt,
    imageUrl,
  });

  return response.data;
};

export const getCalorieLogs = async (): Promise<CalorieLog[]> => {
  const response = await api.get<CalorieLog[]>("/api/calorie-logs");
  return response.data;
};

export const getCalorieLog = async (
  calorieLogId: string,
): Promise<CalorieLog> => {
  const response = await api.get<CalorieLog>(
    `/api/calorie-log/${calorieLogId}`,
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
}): Promise<CalorieLog> => {
  const response = await api.patch<CalorieLog>(
    `/api/calorie-log/${calorieLogId}`,
    {
      name,
      calories,
      consumedAt,
      imageUrl,
    },
  );

  return response.data;
};

export const deleteCalorieLog = async (
  calorieLogId: string,
): Promise<CalorieLog> => {
  const response = await api.delete<CalorieLog>(
    `/api/calorie-log/${calorieLogId}`,
  );

  return response.data;
};

export const createWorkoutLog = async ({
  userId,
  name,
  duration,
  performedAt,
  icon,
}: {
  userId: string;
  name: string;
  duration: number;
  performedAt?: string;
  icon: WorkoutLogIcon;
}): Promise<WorkoutLog> => {
  const response = await api.post<WorkoutLog>("/api/workout-logs", {
    userId,
    name,
    duration,
    performedAt,
    icon,
  });

  return response.data;
};

export const getWorkoutLogs = async (): Promise<WorkoutLog[]> => {
  const response = await api.get<WorkoutLog[]>("/api/workout-logs");
  return response.data;
};

export const getWorkoutLog = async (
  workoutLogId: string,
): Promise<WorkoutLog> => {
  const response = await api.get<WorkoutLog>(
    `/api/workout-log/${workoutLogId}`,
  );

  return response.data;
};

export const updateWorkoutLog = async ({
  name,
  duration,
  performedAt,
  icon,
  workoutLogId,
}: {
  name?: string;
  duration?: number;
  performedAt?: string;
  icon?: WorkoutLogIcon;
  workoutLogId: string;
}): Promise<WorkoutLog> => {
  const response = await api.patch<WorkoutLog>(
    `/api/workout-log/${workoutLogId}`,
    {
      name,
      duration,
      performedAt,
      icon,
    },
  );

  return response.data;
};

export const deleteWorkoutLog = async (
  workoutLogId: string,
): Promise<WorkoutLog> => {
  const response = await api.delete<WorkoutLog>(
    `/api/workout-log/${workoutLogId}`,
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
}): Promise<Goal> => {
  const response = await api.post<Goal>("/api/goals", {
    userId,
    name,
    description,
  });

  return response.data;
};

export const getGoals = async (): Promise<Goal[]> => {
  const response = await api.get<Goal[]>("/api/goals");
  return response.data;
};

export const getGoal = async (goalId: string): Promise<Goal> => {
  const response = await api.get<Goal>(`/api/goal/${goalId}`);
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
}): Promise<Goal> => {
  const response = await api.patch<Goal>(`/api/goal/${goalId}`, {
    name,
    description,
    completed,
    hidden,
  });

  return response.data;
};

export const deleteGoal = async (goalId: string): Promise<Goal> => {
  const response = await api.delete<Goal>(`/api/goal/${goalId}`);
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
}): Promise<CalorieLogPreset> => {
  const response = await api.post<CalorieLogPreset>(
    "/api/calorie-log-presets",
    {
      userId,
      name,
      calories,
      imageUrl,
    },
  );

  return response.data;
};

export const getCalorieLogPresets = async (): Promise<CalorieLogPreset[]> => {
  const response = await api.get<CalorieLogPreset[]>(
    "/api/calorie-log-presets",
  );

  return response.data;
};

export const getCalorieLogPreset = async (
  calorieLogPresetId: string,
): Promise<CalorieLogPreset> => {
  const response = await api.get<CalorieLogPreset>(
    `/api/calorie-log-preset/${calorieLogPresetId}`,
  );

  return response.data;
};

export const updateCalorieLogPreset = async ({
  name,
  calories,
  imageUrl,
  calorieLogPresetId,
}: {
  name?: string;
  calories?: number;
  imageUrl?: string | null | undefined;
  calorieLogPresetId: string;
}): Promise<CalorieLogPreset> => {
  const response = await api.patch<CalorieLogPreset>(
    `/api/calorie-log-preset/${calorieLogPresetId}`,
    {
      name,
      calories,
      imageUrl,
    },
  );

  return response.data;
};

export const deleteCalorieLogPreset = async (
  calorieLogPresetId: string,
): Promise<CalorieLogPreset> => {
  const response = await api.delete<CalorieLogPreset>(
    `/api/calorie-log-preset/${calorieLogPresetId}`,
  );

  return response.data;
};

export const createWorkoutLogPreset = async ({
  userId,
  name,
  duration,
  icon,
}: {
  userId: string;
  name: string;
  duration: number;
  icon: WorkoutLogIcon;
}): Promise<WorkoutLogPreset> => {
  const response = await api.post<WorkoutLogPreset>(
    `/api/workout-log-presets`,
    {
      userId,
      name,
      duration,
      icon,
    },
  );

  return response.data;
};

export const getWorkoutLogPresets = async (): Promise<WorkoutLogPreset[]> => {
  const response = await api.get<WorkoutLogPreset[]>(
    "/api/workout-log-presets",
  );

  return response.data;
};

export const getWorkoutLogPreset = async (
  workoutLogPresetId: string,
): Promise<WorkoutLogPreset> => {
  const response = await api.get<WorkoutLogPreset>(
    `/api/workout-log-preset/${workoutLogPresetId}`,
  );

  return response.data;
};

export const updateWorkoutLogPreset = async ({
  name,
  duration,
  performedAt,
  icon,
  workoutLogPresetId,
}: {
  name?: string;
  duration?: number;
  performedAt?: string;
  icon?: WorkoutLogIcon;
  workoutLogPresetId: string;
}): Promise<WorkoutLogPreset> => {
  const response = await api.patch<WorkoutLogPreset>(
    `/api/workout-log-preset/${workoutLogPresetId}`,
    {
      name,
      duration,
      performedAt,
      icon,
    },
  );

  return response.data;
};

export const deleteWorkoutLogPreset = async (
  workoutLogPresetId: string,
): Promise<WorkoutLogPreset> => {
  const response = await api.delete<WorkoutLogPreset>(
    `/api/workout-log-preset/${workoutLogPresetId}`,
  );

  return response.data;
};

export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
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
