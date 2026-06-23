import { db } from "@/db/index";
import { calorieLog } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, calories, imageUrl, consumedAt } = await request.json();

  const [createdCalorieLog] = await db
    .insert(calorieLog)
    .values({
      userId,
      name,
      calories,
      imageUrl,
      consumedAt,
    })
    .returning();

  return Response.json(createdCalorieLog);
}
