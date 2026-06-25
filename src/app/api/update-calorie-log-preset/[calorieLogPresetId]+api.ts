import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

const updateCalorieLogPresetSchema = createUpdateSchema(calorieLogPreset, {
  name: (schema) => schema.min(1),
  calories: (schema) => schema.int().min(1),
}).pick({ name: true, calories: true, imageUrl: true });

export async function PATCH(
  request: Request,
  { calorieLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!z.uuid().safeParse(calorieLogPresetId).success) {
    return Response.json(
      { error: "Invalid calorie log preset id" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = updateCalorieLogPresetSchema.safeParse(body);

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

  const [updatedCalorieLogPreset] = await db
    .update(calorieLogPreset)
    .set(parsed.data)
    .where(
      and(
        eq(calorieLogPreset.id, calorieLogPresetId),
        eq(calorieLogPreset.userId, session.user.id),
      ),
    )
    .returning();

  if (updatedCalorieLogPreset === undefined) {
    return Response.json(
      { error: "Calorie log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(updatedCalorieLogPreset);
}
