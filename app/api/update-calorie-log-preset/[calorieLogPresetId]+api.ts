import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { calorieLogPresetId }: Record<string, string>,
) {
  const { name, calories, imageUrl } = await request.json();

  const [updatedCalorieLogPreset] = await db
    .update(calorieLogPreset)
    .set({ name, calories, imageUrl })
    .where(eq(calorieLogPreset.id, calorieLogPresetId))
    .returning();

  return Response.json({ calorieLogPreset: updatedCalorieLogPreset });
}
