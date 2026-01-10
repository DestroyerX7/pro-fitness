import { db } from "@/db/index";
import { workoutLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { userId }: Record<string, string>
) {
  const workoutLogs = await db
    .select()
    .from(workoutLog)
    .where(eq(workoutLog.userId, userId));

  return Response.json({ workoutLogs });
}
