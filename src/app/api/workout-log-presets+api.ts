import { db } from "@/db";
import { workoutLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createWorkoutLogSchema = createInsertSchema(workoutLogPreset, {
  name: (schema) => schema.min(1),
  duration: (schema) => schema.int().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkoutLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdWorkoutLogPreset] = await db
    .insert(workoutLogPreset)
    .values(parsed.data)
    .returning();

  return Response.json(createdWorkoutLogPreset);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workoutLogPresets = await db
    .select()
    .from(workoutLogPreset)
    .where(eq(workoutLogPreset.userId, session.user.id))
    .orderBy(desc(workoutLogPreset.createdAt));

  return Response.json(workoutLogPresets);
}
