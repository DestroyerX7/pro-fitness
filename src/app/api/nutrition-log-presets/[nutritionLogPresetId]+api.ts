import { db } from "@/db";
import { nutritionLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const updateNutritionLogPresetSchema = createUpdateSchema(nutritionLogPreset, {
  name: (schema) => schema.min(1),
  calories: (schema) => schema.int().min(1),
  imageUrl: z.httpUrl().nullable().optional(),
}).pick({ name: true, calories: true, imageUrl: true });

export async function GET(
  request: Request,
  { nutritionLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [selectedNutritionLogPreset] = await db
    .select()
    .from(nutritionLogPreset)
    .where(
      and(
        eq(nutritionLogPreset.id, nutritionLogPresetId),
        eq(nutritionLogPreset.userId, session.user.id),
      ),
    );

  if (selectedNutritionLogPreset === undefined) {
    return Response.json(
      { error: "Nutrition log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(selectedNutritionLogPreset);
}

export async function PATCH(
  request: Request,
  { nutritionLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateNutritionLogPresetSchema.safeParse(body);

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

  const [updatedNutritionLogPreset] = await db
    .update(nutritionLogPreset)
    .set(parsed.data)
    .where(
      and(
        eq(nutritionLogPreset.id, nutritionLogPresetId),
        eq(nutritionLogPreset.userId, session.user.id),
      ),
    )
    .returning();

  if (updatedNutritionLogPreset === undefined) {
    return Response.json(
      { error: "Nutrition log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(updatedNutritionLogPreset);
}

export async function DELETE(
  request: Request,
  { nutritionLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedNutritionLogPreset] = await db
    .delete(nutritionLogPreset)
    .where(
      and(
        eq(nutritionLogPreset.id, nutritionLogPresetId),
        eq(nutritionLogPreset.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedNutritionLogPreset === undefined) {
    return Response.json(
      { error: "Nutrition log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(deletedNutritionLogPreset);
}
