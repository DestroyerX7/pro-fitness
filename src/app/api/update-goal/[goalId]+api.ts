import { db } from "@/db";
import { goal } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const updateGoalSchema = createUpdateSchema(goal, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
}).pick({ name: true, description: true, completed: true, hidden: true });

export async function PATCH(
  request: Request,
  { goalId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!z.uuid().safeParse(goalId).success) {
    return Response.json({ error: "Invalid goal id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);

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

  const [updatedGoal] = await db
    .update(goal)
    .set(parsed.data)
    .where(eq(goal.id, goalId))
    .returning();

  if (updatedGoal === undefined) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }

  return Response.json(updatedGoal);
}
