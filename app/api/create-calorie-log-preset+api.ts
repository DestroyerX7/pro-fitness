import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, calories, imageUrl } = await request.json();

  const [createdCalorieLogPreset] = await db
    .insert(calorieLogPreset)
    .values({ userId, name, calories, imageUrl })
    .returning();

  return Response.json({ calorieLogPreset: createdCalorieLogPreset });
}
