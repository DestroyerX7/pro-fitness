import { db } from "@/db/index";
import { calorieLog } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, calories, imageUrl, date } = await request.json();

  const loggedCalories = await db
    .insert(calorieLog)
    .values({ userId, name, calories, imageUrl, date })
    .returning();

  return Response.json({ loggedCalories });
}
