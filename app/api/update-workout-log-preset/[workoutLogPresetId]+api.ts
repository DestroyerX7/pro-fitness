import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { workoutLogPresetId }: Record<string, string>,
) {
  const { name, duration, iconLibrary, iconName } = await request.json();

  const [updatedWorkoutLogPreset] = await db
    .update(workoutLogPreset)
    .set({ name, duration, iconLibrary, iconName })
    .where(eq(workoutLogPreset.id, workoutLogPresetId))
    .returning();

  return Response.json({ calorieLogPreset: updatedWorkoutLogPreset });
}
