import { z } from "zod";
import { WorkoutLogIcon } from "./types/workout-log-icon";

export const nutritionLogSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  calories: z
    .string()
    .trim()
    .min(1, "Please enter a calorie amount")
    .regex(/^\d+$/, "Calories must be a whole number")
    .refine((val) => Number(val) > 0, "Calories must be greater than 0"),
  consumedAt: z.date(),
  imageUri: z.url().nullable(),
});

export type NutritionLogFormValues = z.infer<typeof nutritionLogSchema>;

export const workoutLogSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  durationMinutes: z
    .string()
    .trim()
    .min(1, "Please enter a duration in minutes")
    .regex(/^\d+$/, "Duration must be a whole number")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  performedAt: z.date(),
  icon: z.custom<WorkoutLogIcon>(),
});

export type WorkoutLogFormValues = z.infer<typeof workoutLogSchema>;

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  description: z.string().trim().nullable().optional(),
  completed: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export const scanSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  caloriesPerServing: z
    .string()
    .trim()
    .min(1, "Please enter calories per serving")
    .refine(
      (val) => Number(val) > 0,
      "Calories per serving must be greater than 0",
    ),
  numServings: z
    .string()
    .trim()
    .min(1, "Please enter number of servings")
    .refine(
      (val) => Number(val) > 0,
      "Number of servings must be greater than 0",
    ),
  consumedAt: z.date(),
  imageUri: z.url().nullable(),
});

export type ScanFormValues = z.infer<typeof scanSchema>;

export const nutritionLogPresetSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  calories: z
    .string()
    .trim()
    .min(1, "Please enter a calorie amount")
    .regex(/^\d+$/, "Calories must be a whole number")
    .refine((val) => Number(val) > 0, "Calories must be greater than 0"),
  imageUri: z.url().nullable(),
});

export type NutritionLogPresetFormValues = z.infer<
  typeof nutritionLogPresetSchema
>;

export const workoutLogPresetSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  durationMinutes: z
    .string()
    .trim()
    .min(1, "Please enter a duration in minutes")
    .regex(/^\d+$/, "Duration must be a whole number")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  icon: z.custom<WorkoutLogIcon>(),
});

export type WorkoutLogPresetFormValues = z.infer<typeof workoutLogPresetSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  dailyCalorieTarget: z
    .string()
    .trim()
    .min(1, "Please enter a calorie amount")
    .regex(/^\d+$/, "Calories must be a whole number")
    .refine((val) => Number(val) > 0, "Calories must be greater than 0"),
  dailyWorkoutMinutesTarget: z
    .string()
    .trim()
    .min(1, "Please enter a duration in minutes")
    .regex(/^\d+$/, "Duration must be a whole number")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  imageUri: z.url().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
