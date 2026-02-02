CREATE TYPE "public"."icon_library_enum" AS ENUM('MaterialIcons', 'MaterialCommunityIcons');--> statement-breakpoint
ALTER TABLE "workout_log" ALTER COLUMN "icon_library" SET DATA TYPE "public"."icon_library_enum" USING "icon_library"::"public"."icon_library_enum";--> statement-breakpoint
ALTER TABLE "workout_log_preset" ALTER COLUMN "icon_library" SET DATA TYPE "public"."icon_library_enum" USING "icon_library"::"public"."icon_library_enum";--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;