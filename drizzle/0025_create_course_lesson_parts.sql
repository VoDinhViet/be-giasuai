CREATE TYPE "public"."course_lesson_part_type" AS ENUM('TEXT', 'VIDEO', 'EXERCISE', 'QUIZ', 'RESOURCE');--> statement-breakpoint
CREATE TABLE "course_lesson_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "course_lesson_part_type" DEFAULT 'TEXT' NOT NULL,
	"content" text NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ADD CONSTRAINT "course_lesson_parts_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;
