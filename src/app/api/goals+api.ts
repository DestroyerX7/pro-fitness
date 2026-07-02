import { db } from "@/db";
import { goal } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createGoalSchema = createInsertSchema(goal, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createGoalSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdGoal] = await db.insert(goal).values(parsed.data).returning();
  return Response.json(createdGoal);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await db
    .select()
    .from(goal)
    .where(eq(goal.userId, session.user.id))
    .orderBy(desc(goal.createdAt));

  return Response.json(goals);
}
