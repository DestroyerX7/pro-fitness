import { db } from "@/db/index";
import { nutritionLog } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createNutritionLogSchema = createInsertSchema(nutritionLog, {
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
  const parsed = createNutritionLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdNutritionLog] = await db
    .insert(nutritionLog)
    .values(parsed.data)
    .returning();

  return Response.json(createdNutritionLog);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nutritionLogs = await db
    .select()
    .from(nutritionLog)
    .where(eq(nutritionLog.userId, session.user.id))
    .orderBy(desc(nutritionLog.consumedAt));

  return Response.json(nutritionLogs);
}
