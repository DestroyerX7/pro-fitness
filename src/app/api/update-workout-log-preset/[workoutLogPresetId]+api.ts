import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const updateWorkoutLogPresetSchema = createUpdateSchema(workoutLogPreset, {
  name: (schema) => schema.min(1),
  duration: (schema) => schema.int().min(1),
}).pick({ name: true, duration: true, icon: true });

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

  if (!z.uuid().safeParse(workoutLogPresetId).success) {
    return Response.json(
      { error: "Invalid workout log preset id" },
      { status: 400 },
    );
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
