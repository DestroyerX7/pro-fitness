import { db } from "@/db";
import { workoutLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";

const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const updateWorkoutLogSchema = createUpdateSchema(workoutLog, {
  name: (schema) => schema.min(1),
  duration: (schema) => schema.int().min(1),
  performedAt: (schema) =>
    schema
      .regex(datetimeRegex, "Expected format: YYYY-MM-DD HH:mm:ss")
      .refine(
        (val) => !Number.isNaN(new Date(val.replace(" ", "T")).getTime()),
        { message: "Invalid date" },
      ),
}).pick({ name: true, duration: true, performedAt: true, icon: true });

export async function GET(
  request: Request,
  { workoutLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [selectedWorkoutLog] = await db
    .select()
    .from(workoutLog)
    .where(
      and(
        eq(workoutLog.id, workoutLogId),
        eq(workoutLog.userId, session.user.id),
      ),
    );

  if (selectedWorkoutLog === undefined) {
    return Response.json({ error: "Workout log not found" }, { status: 404 });
  }

  return Response.json(selectedWorkoutLog);
}

export async function PATCH(
  request: Request,
  { workoutLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateWorkoutLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return Response.json(
      { error: "No fields provided to update" },
      { status: 400 },
    );
  }

  const [updatedWorkoutLog] = await db
    .update(workoutLog)
    .set(parsed.data)
    .where(eq(workoutLog.id, workoutLogId))
    .returning();

  if (updatedWorkoutLog === undefined) {
    return Response.json({ error: "Workout log not found" }, { status: 404 });
  }

  return Response.json(updatedWorkoutLog);
}

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
