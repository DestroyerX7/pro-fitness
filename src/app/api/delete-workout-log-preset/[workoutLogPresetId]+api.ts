import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { workoutLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedWorkoutLogPreset] = await db
    .delete(workoutLogPreset)
    .where(
      and(
        eq(workoutLogPreset.id, workoutLogPresetId),
        eq(workoutLogPreset.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedWorkoutLogPreset === undefined) {
    return Response.json(
      { error: "Workout log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(deletedWorkoutLogPreset);
}
