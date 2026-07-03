CREATE TABLE "daily_target" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calorie_target" integer DEFAULT 2000 NOT NULL,
	"workout_minutes_target" integer DEFAULT 30 NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_target_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "calorie_log" RENAME TO "nutrition_log";--> statement-breakpoint
ALTER TABLE "calorie_log_preset" RENAME TO "nutrition_log_preset";--> statement-breakpoint
ALTER TABLE "workout_log" RENAME COLUMN "duration" TO "duration_minutes";--> statement-breakpoint
ALTER TABLE "workout_log_preset" RENAME COLUMN "duration" TO "duration_minutes";--> statement-breakpoint
ALTER TABLE "nutrition_log" DROP CONSTRAINT "calorie_log_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "nutrition_log_preset" DROP CONSTRAINT "calorie_log_preset_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "calorie_log_userId_idx";--> statement-breakpoint
DROP INDEX "calorie_log_preset_userId_idx";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "daily_target" ADD CONSTRAINT "daily_target_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_log" ADD CONSTRAINT "nutrition_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_log_preset" ADD CONSTRAINT "nutrition_log_preset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nutrition_log_userId_idx" ON "nutrition_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "nutrition_log_preset_userId_idx" ON "nutrition_log_preset" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "daily_calorie_goal";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "daily_workout_goal";