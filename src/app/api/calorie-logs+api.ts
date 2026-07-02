import { db } from "@/db/index";
import { calorieLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createCalorieLogSchema = createInsertSchema(calorieLog, {
  name: (schema) => schema.min(1),
  calories: (schema) => schema.int().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCalorieLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdCalorieLog] = await db
    .insert(calorieLog)
    .values(parsed.data)
    .returning();

  return Response.json(createdCalorieLog);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calorieLogs = await db
    .select()
    .from(calorieLog)
    .where(eq(calorieLog.userId, session.user.id))
    .orderBy(desc(calorieLog.consumedAt));

  return Response.json(calorieLogs);
}
