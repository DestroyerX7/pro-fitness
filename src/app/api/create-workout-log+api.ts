import { db } from "@/db/index";
import { workoutLog } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, duration, performedAt, iconLibrary, iconName } =
    await request.json();

  const [createdWorkoutLog] = await db
    .insert(workoutLog)
    .values({
      userId,
      name,
      duration,
      performedAt,
      iconLibrary,
      iconName,
    })
    .returning();

  return Response.json(createdWorkoutLog);
}
