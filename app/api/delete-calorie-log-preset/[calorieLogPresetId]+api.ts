import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _: Request,
  { calorieLogPresetId }: Record<string, string>,
) {
  const [deletedCalorieLogPreset] = await db
    .delete(calorieLogPreset)
    .where(eq(calorieLogPreset.id, calorieLogPresetId))
    .returning();

  return Response.json({ calorieLogPreset: deletedCalorieLogPreset });
}
