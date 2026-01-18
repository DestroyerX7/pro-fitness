import { db } from "@/db";
import { workoutLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _: Request,
  { workoutLogId }: Record<string, string>,
) {
  const [deletedWorkoutLog] = await db
    .delete(workoutLog)
    .where(eq(workoutLog.id, workoutLogId))
    .returning();

  return Response.json({ workoutLog: deletedWorkoutLog });
}
