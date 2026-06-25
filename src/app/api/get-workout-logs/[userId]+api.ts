import { db } from "@/db/index";
import { workoutLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { userId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const workoutLogs = await db
    .select()
    .from(workoutLog)
    .where(eq(workoutLog.userId, userId))
    .orderBy(desc(workoutLog.performedAt));

  return Response.json(workoutLogs);
}
