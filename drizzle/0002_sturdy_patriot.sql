ALTER TABLE "workout_log" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "calorie_log" ADD COLUMN "date" date DEFAULT now() NOT NULL;