import { db } from "@/db";
import { nutritionLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const updateNutritionLogSchema = createUpdateSchema(nutritionLog, {
  name: (schema) => schema.min(1),
  calories: (schema) => schema.int().min(1),
  consumedAt: (schema) =>
    schema
      .regex(datetimeRegex, "Expected format: YYYY-MM-DD HH:mm:ss")
      .refine(
        (val) => !Number.isNaN(new Date(val.replace(" ", "T")).getTime()),
        { message: "Invalid date" },
      ),
  imageUrl: z.httpUrl().nullable().optional(),
}).pick({ name: true, calories: true, consumedAt: true, imageUrl: true });

export async function GET(
  request: Request,
  { nutritionLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [selectedNutritionLog] = await db
    .select()
    .from(nutritionLog)
    .where(
      and(
        eq(nutritionLog.id, nutritionLogId),
        eq(nutritionLog.userId, session.user.id),
      ),
    );

  if (selectedNutritionLog === undefined) {
    return Response.json({ error: "Nutrition log not found" }, { status: 404 });
  }

  return Response.json(selectedNutritionLog);
}

export async function PATCH(
  request: Request,
  { nutritionLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateNutritionLogSchema.safeParse(body);

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

  const [updatedNutritionLog] = await db
    .update(nutritionLog)
    .set(parsed.data)
    .where(
      and(
        eq(nutritionLog.id, nutritionLogId),
        eq(nutritionLog.userId, session.user.id),
      ),
    )
    .returning();

  if (updatedNutritionLog === undefined) {
    return Response.json({ error: "Nutrition log not found" }, { status: 404 });
  }

  return Response.json(updatedNutritionLog);
}

export async function DELETE(
  request: Request,
  { nutritionLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedNutritionLog] = await db
    .delete(nutritionLog)
    .where(
      and(
        eq(nutritionLog.id, nutritionLogId),
        eq(nutritionLog.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedNutritionLog === undefined) {
    return Response.json({ error: "Nutrition log not found" }, { status: 404 });
  }

  return Response.json(deletedNutritionLog);
}
