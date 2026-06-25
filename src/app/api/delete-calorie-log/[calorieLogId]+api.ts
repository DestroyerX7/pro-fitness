import { db } from "@/db";
import { calorieLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { calorieLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedCalorieLog] = await db
    .delete(calorieLog)
    .where(
      and(
        eq(calorieLog.id, calorieLogId),
        eq(calorieLog.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedCalorieLog === undefined) {
    return Response.json({ error: "Calorie log not found" }, { status: 404 });
  }

  return Response.json(deletedCalorieLog);
}
