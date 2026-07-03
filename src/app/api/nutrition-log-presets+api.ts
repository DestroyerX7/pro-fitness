import { db } from "@/db";
import { nutritionLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

const createNutritionLogPresetSchema = createInsertSchema(nutritionLogPreset, {
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
  const parsed = createNutritionLogPresetSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdNutritionLogPreset] = await db
    .insert(nutritionLogPreset)
    .values(parsed.data)
    .returning();

  return Response.json(createdNutritionLogPreset);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nutritionLogPresets = await db
    .select()
    .from(nutritionLogPreset)
    .where(eq(nutritionLogPreset.userId, session.user.id))
    .orderBy(desc(nutritionLogPreset.createdAt));

  return Response.json(nutritionLogPresets);
}
