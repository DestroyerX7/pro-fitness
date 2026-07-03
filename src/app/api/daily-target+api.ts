import { db } from "@/db";
import { dailyTarget } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";

const updateDailyTargetSchema = createUpdateSchema(dailyTarget, {
  calorieTarget: (schema) => schema.min(1),
  workoutMinutesTarget: (schema) => schema.min(1),
}).pick({ calorieTarget: true, workoutMinutesTarget: true });

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unathorized" }, { status: 401 });
  }

  const [selectedDailyTarget] = await db
    .select()
    .from(dailyTarget)
    .where(eq(dailyTarget.userId, session.user.id));

  if (selectedDailyTarget === undefined) {
    const [createdDailyTarget] = await db
      .insert(dailyTarget)
      .values({ userId: session.user.id })
      .returning();

    return Response.json(createdDailyTarget);
  }

  return Response.json(selectedDailyTarget);
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unathorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateDailyTargetSchema.safeParse(body);

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

  const [updatedDailyTarget] = await db
    .update(dailyTarget)
    .set(parsed.data)
    .where(eq(dailyTarget.userId, session.user.id))
    .returning();

  if (updatedDailyTarget === undefined) {
    return Response.json({ error: "Daily target not found" }, { status: 404 });
  }

  return Response.json(updatedDailyTarget);
}
