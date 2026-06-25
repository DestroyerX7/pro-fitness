import { db } from "@/db";
import { workoutLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { workoutLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedWorkoutLog] = await db
    .delete(workoutLog)
    .where(
      and(
        eq(workoutLog.id, workoutLogId),
        eq(workoutLog.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedWorkoutLog === undefined) {
    return Response.json({ error: "Workout log not found" }, { status: 404 });
  }

  return Response.json(deletedWorkoutLog);
}
