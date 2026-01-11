import { db } from "@/db/index";
import { workoutLog } from "@/db/schema";

export async function POST(request: Request) {
  const { userId, name, duration, date, iconLibrary, iconName } =
    await request.json();

  const loggedWorkout = await db
    .insert(workoutLog)
    .values({ userId, name, duration, date, iconLibrary, iconName })
    .returning();

  return Response.json({ loggedWorkout });
}
