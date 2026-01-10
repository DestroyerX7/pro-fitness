CREATE TABLE "calorie_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"calories" integer NOT NULL,
	"image_url" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"duration" integer NOT NULL,
	"date" date NOT NULL,
	"icon_name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "daily_calorie_goal" integer DEFAULT 2000 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "daily_workout_goal" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "calorie_log" ADD CONSTRAINT "calorie_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_log" ADD CONSTRAINT "workout_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calorie_log_userId_idx" ON "calorie_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workout_log_userId_idx" ON "workout_log" USING btree ("user_id");