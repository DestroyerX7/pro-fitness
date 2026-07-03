import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";

const updateWorkoutLogPresetSchema = createUpdateSchema(workoutLogPreset, {
  name: (schema) => schema.min(1),
  durationMinutes: (schema) => schema.int().min(1),
}).pick({ name: true, durationMinutes: true, icon: true });

export async function GET(
  request: Request,
  { workoutLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [selectedWorkoutLogPreset] = await db
    .select()
    .from(workoutLogPreset)
    .where(
      and(
        eq(workoutLogPreset.id, workoutLogPresetId),
        eq(workoutLogPreset.userId, session.user.id),
      ),
    );

  if (selectedWorkoutLogPreset === undefined) {
    return Response.json(
      { error: "Workout log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(selectedWorkoutLogPreset);
}

export async function PATCH(
  request: Request,
  { workoutLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateWorkoutLogPresetSchema.safeParse(body);

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

  const [updatedWorkoutLogPreset] = await db
    .update(workoutLogPreset)
    .set(parsed.data)
    .where(eq(workoutLogPreset.id, workoutLogPresetId))
    .returning();

  if (updatedWorkoutLogPreset === undefined) {
    return Response.json(
      { error: "Workout log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(updatedWorkoutLogPreset);
}

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
