import { db } from "@/db";
import { workoutLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { workoutLogId }: Record<string, string>,
) {
  const { name, duration, date, iconLibrary, iconName } = await request.json();

  const [updatedWorkoutLog] = await db
    .update(workoutLog)
    .set({ name, duration, date, iconLibrary, iconName })
    .where(eq(workoutLog.id, workoutLogId))
    .returning();

  return Response.json({ workoutLog: updatedWorkoutLog });
}
