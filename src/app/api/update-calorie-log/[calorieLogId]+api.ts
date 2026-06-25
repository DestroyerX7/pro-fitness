import { db } from "@/db";
import { calorieLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const updateCalorieLogSchema = createUpdateSchema(calorieLog, {
  name: (schema) => schema.min(1),
  calories: (schema) => schema.int().min(1),
  consumedAt: (schema) =>
    schema
      .regex(datetimeRegex, "Expected format: YYYY-MM-DD HH:mm:ss")
      .refine(
        (val) => !Number.isNaN(new Date(val.replace(" ", "T")).getTime()),
        { message: "Invalid date" },
      ),
}).pick({ name: true, calories: true, consumedAt: true, imageUrl: true });

export async function PATCH(
  request: Request,
  { calorieLogId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!z.uuid().safeParse(calorieLogId).success) {
    return Response.json({ error: "Invalid calorie log id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateCalorieLogSchema.safeParse(body);

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

  const [updatedCalorieLog] = await db
    .update(calorieLog)
    .set(parsed.data)
    .where(
      and(
        eq(calorieLog.id, calorieLogId),
        eq(calorieLog.userId, session.user.id),
      ),
    )
    .returning();

  if (updatedCalorieLog === undefined) {
    return Response.json({ error: "Calorie log not found" }, { status: 404 });
  }

  return Response.json(updatedCalorieLog);
}
