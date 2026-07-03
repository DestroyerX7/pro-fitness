import {
  dailyTarget,
  goal,
  nutritionLog,
  nutritionLogPreset,
  workoutLog,
  workoutLogPreset,
} from "@/db/schema";
import axios from "axios";
import { authClient } from "./auth-client";
import { fromSqlTimestampToLocalDate } from "./dates";
import type { WorkoutLogIcon } from "./types/workout-log-icon";

type Serialized<T> = T extends Date ? string : T;

export type DailyTarget = typeof dailyTarget.$inferSelect;
type DailyTargetResponse = Serialized<DailyTarget>;

type NutritionLogResponse = Serialized<typeof nutritionLog.$inferSelect>;
export type NutritionLog = Omit<NutritionLogResponse, "consumedAt"> & {
  consumedAt: Date;
};

type WorkoutLogResponse = Serialized<typeof workoutLog.$inferSelect>;
export type WorkoutLog = Omit<WorkoutLogResponse, "performedAt"> & {
  performedAt: Date;
};

export type Goal = typeof goal.$inferSelect;
type GoalResponse = Serialized<Goal>;

export type NutritionLogPreset = typeof nutritionLogPreset.$inferSelect;
type NutritionLogPresetResponse = Serialized<NutritionLogPreset>;

export type WorkoutLogPreset = typeof workoutLogPreset.$inferSelect;
type WorkoutLogPresetResponse = Serialized<WorkoutLogPreset>;

type CloudinarySignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

function reviveNutritionLog(raw: NutritionLogResponse): NutritionLog {
  return {
    ...raw,
    consumedAt: fromSqlTimestampToLocalDate(raw.consumedAt),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function reviveWorkoutLog(raw: WorkoutLogResponse): WorkoutLog {
  return {
    ...raw,
    performedAt: fromSqlTimestampToLocalDate(raw.performedAt),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function reviveGoal(raw: GoalResponse): Goal {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function reviveDailyTarget(raw: DailyTargetResponse): DailyTarget {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function reviveNutritionLogPreset(
  raw: NutritionLogPresetResponse,
): NutritionLogPreset {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function reviveWorkoutLogPreset(
  raw: WorkoutLogPresetResponse,
): WorkoutLogPreset {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

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

/* ---------------------------------------------------------------------- */
/*  Nutrition logs                                                        */
/* ---------------------------------------------------------------------- */

export const createNutritionLog = async ({
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
  imageUrl?: string | null;
}): Promise<NutritionLog> => {
  const response = await api.post<NutritionLogResponse>("/api/nutrition-logs", {
    userId,
    name,
    calories,
    consumedAt,
    imageUrl,
  });

  return reviveNutritionLog(response.data);
};

export const getNutritionLogs = async (): Promise<NutritionLog[]> => {
  const response = await api.get<NutritionLogResponse[]>("/api/nutrition-logs");
  return response.data.map(reviveNutritionLog);
};

export const getNutritionLog = async (
  nutritionLogId: string,
): Promise<NutritionLog> => {
  const response = await api.get<NutritionLogResponse>(
    `/api/nutrition-logs/${nutritionLogId}`,
  );

  return reviveNutritionLog(response.data);
};

export const updateNutritionLog = async ({
  name,
  calories,
  consumedAt,
  imageUrl,
  nutritionLogId,
}: {
  name?: string;
  calories?: number;
  consumedAt?: string;
  imageUrl?: string | null;
  nutritionLogId: string;
}): Promise<NutritionLog> => {
  const response = await api.patch<NutritionLogResponse>(
    `/api/nutrition-logs/${nutritionLogId}`,
    { name, calories, consumedAt, imageUrl },
  );

  return reviveNutritionLog(response.data);
};

export const deleteNutritionLog = async (
  nutritionLogId: string,
): Promise<NutritionLog> => {
  const response = await api.delete<NutritionLogResponse>(
    `/api/nutrition-logs/${nutritionLogId}`,
  );

  return reviveNutritionLog(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Workout logs                                                          */
/* ---------------------------------------------------------------------- */

export const createWorkoutLog = async ({
  userId,
  name,
  durationMinutes,
  performedAt,
  icon,
}: {
  userId: string;
  name: string;
  durationMinutes: number;
  performedAt?: string;
  icon: WorkoutLogIcon;
}): Promise<WorkoutLog> => {
  const response = await api.post<WorkoutLogResponse>("/api/workout-logs", {
    userId,
    name,
    durationMinutes,
    performedAt,
    icon,
  });

  return reviveWorkoutLog(response.data);
};

export const getWorkoutLogs = async (): Promise<WorkoutLog[]> => {
  const response = await api.get<WorkoutLogResponse[]>("/api/workout-logs");
  return response.data.map(reviveWorkoutLog);
};

export const getWorkoutLog = async (
  workoutLogId: string,
): Promise<WorkoutLog> => {
  const response = await api.get<WorkoutLogResponse>(
    `/api/workout-logs/${workoutLogId}`,
  );

  return reviveWorkoutLog(response.data);
};

export const updateWorkoutLog = async ({
  name,
  durationMinutes,
  performedAt,
  icon,
  workoutLogId,
}: {
  name?: string;
  durationMinutes?: number;
  performedAt?: string;
  icon?: WorkoutLogIcon;
  workoutLogId: string;
}): Promise<WorkoutLog> => {
  const response = await api.patch<WorkoutLogResponse>(
    `/api/workout-logs/${workoutLogId}`,
    { name, durationMinutes, performedAt, icon },
  );

  return reviveWorkoutLog(response.data);
};

export const deleteWorkoutLog = async (
  workoutLogId: string,
): Promise<WorkoutLog> => {
  const response = await api.delete<WorkoutLogResponse>(
    `/api/workout-logs/${workoutLogId}`,
  );

  return reviveWorkoutLog(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Goals                                                                  */
/* ---------------------------------------------------------------------- */

export const createGoal = async ({
  userId,
  name,
  description,
}: {
  userId: string;
  name: string;
  description?: string | null;
}): Promise<Goal> => {
  const response = await api.post<GoalResponse>("/api/goals", {
    userId,
    name,
    description,
  });

  return reviveGoal(response.data);
};

export const getGoals = async (): Promise<Goal[]> => {
  const response = await api.get<GoalResponse[]>("/api/goals");
  return response.data.map(reviveGoal);
};

export const getGoal = async (goalId: string): Promise<Goal> => {
  const response = await api.get<GoalResponse>(`/api/goals/${goalId}`);
  return reviveGoal(response.data);
};

export const updateGoal = async ({
  name,
  description,
  completed,
  hidden,
  goalId,
}: {
  name?: string;
  description?: string | null;
  completed?: boolean;
  hidden?: boolean;
  goalId: string;
}): Promise<Goal> => {
  const response = await api.patch<GoalResponse>(`/api/goals/${goalId}`, {
    name,
    description,
    completed,
    hidden,
  });

  return reviveGoal(response.data);
};

export const deleteGoal = async (goalId: string): Promise<Goal> => {
  const response = await api.delete<GoalResponse>(`/api/goals/${goalId}`);
  return reviveGoal(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Daily target — singleton, one per user, no id-based routes            */
/* ---------------------------------------------------------------------- */

export const getDailyTarget = async (): Promise<DailyTarget> => {
  const response = await api.get<DailyTargetResponse>("/api/daily-target");
  return reviveDailyTarget(response.data);
};

export const updateDailyTarget = async ({
  calorieTarget,
  workoutMinutesTarget,
}: {
  calorieTarget?: number;
  workoutMinutesTarget?: number;
}): Promise<DailyTarget> => {
  const response = await api.patch<DailyTargetResponse>("/api/daily-target", {
    calorieTarget,
    workoutMinutesTarget,
  });

  return reviveDailyTarget(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Nutrition log presets                                                  */
/* ---------------------------------------------------------------------- */

export const createNutritionLogPreset = async ({
  userId,
  name,
  calories,
  imageUrl,
}: {
  userId: string;
  name: string;
  calories: number;
  imageUrl?: string | null;
}): Promise<NutritionLogPreset> => {
  const response = await api.post<NutritionLogPresetResponse>(
    "/api/nutrition-log-presets",
    { userId, name, calories, imageUrl },
  );

  return reviveNutritionLogPreset(response.data);
};

export const getNutritionLogPresets = async (): Promise<
  NutritionLogPreset[]
> => {
  const response = await api.get<NutritionLogPresetResponse[]>(
    "/api/nutrition-log-presets",
  );

  return response.data.map(reviveNutritionLogPreset);
};

export const getNutritionLogPreset = async (
  nutritionLogPresetId: string,
): Promise<NutritionLogPreset> => {
  const response = await api.get<NutritionLogPresetResponse>(
    `/api/nutrition-log-presets/${nutritionLogPresetId}`,
  );

  return reviveNutritionLogPreset(response.data);
};

export const updateNutritionLogPreset = async ({
  name,
  calories,
  imageUrl,
  nutritionLogPresetId,
}: {
  name?: string;
  calories?: number;
  imageUrl?: string | null;
  nutritionLogPresetId: string;
}): Promise<NutritionLogPreset> => {
  const response = await api.patch<NutritionLogPresetResponse>(
    `/api/nutrition-log-presets/${nutritionLogPresetId}`,
    { name, calories, imageUrl },
  );

  return reviveNutritionLogPreset(response.data);
};

export const deleteNutritionLogPreset = async (
  nutritionLogPresetId: string,
): Promise<NutritionLogPreset> => {
  const response = await api.delete<NutritionLogPresetResponse>(
    `/api/nutrition-log-presets/${nutritionLogPresetId}`,
  );

  return reviveNutritionLogPreset(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Workout log presets                                                    */
/* ---------------------------------------------------------------------- */

export const createWorkoutLogPreset = async ({
  userId,
  name,
  durationMinutes,
  icon,
}: {
  userId: string;
  name: string;
  durationMinutes: number;
  icon: WorkoutLogIcon;
}): Promise<WorkoutLogPreset> => {
  const response = await api.post<WorkoutLogPresetResponse>(
    "/api/workout-log-presets",
    { userId, name, durationMinutes, icon },
  );

  return reviveWorkoutLogPreset(response.data);
};

export const getWorkoutLogPresets = async (): Promise<WorkoutLogPreset[]> => {
  const response = await api.get<WorkoutLogPresetResponse[]>(
    "/api/workout-log-presets",
  );

  return response.data.map(reviveWorkoutLogPreset);
};

export const getWorkoutLogPreset = async (
  workoutLogPresetId: string,
): Promise<WorkoutLogPreset> => {
  const response = await api.get<WorkoutLogPresetResponse>(
    `/api/workout-log-presets/${workoutLogPresetId}`,
  );

  return reviveWorkoutLogPreset(response.data);
};

export const updateWorkoutLogPreset = async ({
  name,
  durationMinutes,
  icon,
  workoutLogPresetId,
}: {
  name?: string;
  durationMinutes?: number;
  icon?: WorkoutLogIcon;
  workoutLogPresetId: string;
}): Promise<WorkoutLogPreset> => {
  const response = await api.patch<WorkoutLogPresetResponse>(
    `/api/workout-log-presets/${workoutLogPresetId}`,
    { name, durationMinutes, icon },
  );

  return reviveWorkoutLogPreset(response.data);
};

export const deleteWorkoutLogPreset = async (
  workoutLogPresetId: string,
): Promise<WorkoutLogPreset> => {
  const response = await api.delete<WorkoutLogPresetResponse>(
    `/api/workout-log-presets/${workoutLogPresetId}`,
  );

  return reviveWorkoutLogPreset(response.data);
};

/* ---------------------------------------------------------------------- */
/*  Cloudinary upload                                                      */
/* ---------------------------------------------------------------------- */

export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  const signResponse = await api.post<CloudinarySignatureResponse>(
    "/api/sign-cloudinary-upload",
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
