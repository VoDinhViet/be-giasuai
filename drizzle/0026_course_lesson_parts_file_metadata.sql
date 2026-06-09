ALTER TABLE "course_lesson_parts" RENAME COLUMN "content" TO "file_url";--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ADD COLUMN "original_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ADD COLUMN "mime_type" varchar(120) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ADD COLUMN "size_bytes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ALTER COLUMN "original_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "course_lesson_parts" ALTER COLUMN "mime_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "course_lesson_parts" DROP COLUMN "duration_minutes";
