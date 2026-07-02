import { WorkoutLogIcon } from "@/components/WorkoutLogIconDisplay";
import { z } from "zod";

export const calorieLogSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  calories: z
    .string()
    .trim()
    .min(1, "Please enter a calorie amount")
    .regex(/^\d+$/, "Calories must be a whole number")
    .refine((val) => Number(val) > 0, "Calories must be greater than 0"),
  consumedAt: z.date(),
  imageUri: z.string().nullable(),
});

export type CalorieLogFormValues = z.infer<typeof calorieLogSchema>;

export const workoutLogSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  duration: z
    .string()
    .trim()
    .min(1, "Please enter a duration")
    .regex(/^\d+$/, "Duration must be a whole number")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  performedAt: z.date(),
  icon: z.custom<WorkoutLogIcon>(),
});

export type WorkoutLogFormValues = z.infer<typeof workoutLogSchema>;

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  description: z.string().trim(),
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
  numberOfServings: z
    .string()
    .trim()
    .min(1, "Please enter number of servings")
    .refine(
      (val) => Number(val) > 0,
      "Number of servings must be greater than 0",
    ),
  consumedAt: z.date(),
  imageUri: z.string().nullable(),
});

export type ScanFormValues = z.infer<typeof scanSchema>;

export const calorieLogPresetSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  calories: z
    .string()
    .trim()
    .min(1, "Please enter a calorie amount")
    .regex(/^\d+$/, "Calories must be a whole number")
    .refine((val) => Number(val) > 0, "Calories must be greater than 0"),
  imageUri: z.string().nullable(),
});

export type CalorieLogPresetFormValues = z.infer<typeof calorieLogPresetSchema>;

export const workoutLogPresetSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  duration: z
    .string()
    .trim()
    .min(1, "Please enter a duration")
    .regex(/^\d+$/, "Duration must be a whole number")
    .refine((val) => Number(val) > 0, "Duration must be greater than 0"),
  icon: z.custom<WorkoutLogIcon>(),
});

export type WorkoutLogPresetFormValues = z.infer<typeof workoutLogPresetSchema>;
