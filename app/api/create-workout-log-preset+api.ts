import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, duration, iconLibrary, iconName } =
    await request.json();

  const [createdWorkoutLogPreset] = await db
    .insert(workoutLogPreset)
    .values({ userId, name, duration, iconLibrary, iconName })
    .returning();

  return Response.json({ workoutLogPreset: createdWorkoutLogPreset });
}
