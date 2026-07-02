import { db } from "@/db/index";
import { workoutLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createWorkoutLogSchema = createInsertSchema(workoutLog, {
  name: (schema) => schema.min(1),
  duration: (schema) => schema.int().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkoutLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdWorkoutLog] = await db
    .insert(workoutLog)
    .values(parsed.data)
    .returning();

  return Response.json(createdWorkoutLog);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workoutLogs = await db
    .select()
    .from(workoutLog)
    .where(eq(workoutLog.userId, session.user.id))
    .orderBy(desc(workoutLog.performedAt));

  return Response.json(workoutLogs);
}
