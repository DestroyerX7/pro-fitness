import { db } from "@/db";
import { calorieLogPreset } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { calorieLogPresetId }: Record<string, string>,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedCalorieLogPreset] = await db
    .delete(calorieLogPreset)
    .where(
      and(
        eq(calorieLogPreset.id, calorieLogPresetId),
        eq(calorieLogPreset.userId, session.user.id),
      ),
    )
    .returning();

  if (deletedCalorieLogPreset === undefined) {
    return Response.json(
      { error: "Calorie log preset not found" },
      { status: 404 },
    );
  }

  return Response.json(deletedCalorieLogPreset);
}
