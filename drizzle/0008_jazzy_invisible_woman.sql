ALTER TABLE "workout_log" ADD COLUMN "icon" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_log_preset" ADD COLUMN "icon" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_log" DROP COLUMN "icon_library";--> statement-breakpoint
ALTER TABLE "workout_log" DROP COLUMN "icon_name";--> statement-breakpoint
ALTER TABLE "workout_log_preset" DROP COLUMN "icon_library";--> statement-breakpoint
ALTER TABLE "workout_log_preset" DROP COLUMN "icon_name";--> statement-breakpoint
DROP TYPE "public"."icon_library_enum";