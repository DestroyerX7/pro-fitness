import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createInsertSchema } from "drizzle-zod";

const createCalorieLogPresetSchema = createInsertSchema(calorieLogPreset, {
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
  const parsed = createCalorieLogPresetSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", message: parsed.error.message },
      { status: 400 },
    );
  }

  const [createdCalorieLogPreset] = await db
    .insert(calorieLogPreset)
    .values(parsed.data)
    .returning();

  return Response.json(createdCalorieLogPreset);
}
