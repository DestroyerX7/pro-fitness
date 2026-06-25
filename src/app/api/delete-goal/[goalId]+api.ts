import { db } from "@/db";
import { goal } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { goalId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedGoal] = await db
    .delete(goal)
    .where(and(eq(goal.id, goalId), eq(goal.userId, session.user.id)))
    .returning();

  if (deletedGoal === undefined) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }

  return Response.json(deletedGoal);
}
