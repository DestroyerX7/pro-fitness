import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _: Request,
  { workoutLogPresetId }: Record<string, string>,
) {
  const [deletedWorkoutLogPreset] = await db
    .delete(workoutLogPreset)
    .where(eq(workoutLogPreset.id, workoutLogPresetId))
    .returning();

  return Response.json({ calorieLogPreset: deletedWorkoutLogPreset });
}
