ALTER TABLE "course_lessons" DROP CONSTRAINT IF EXISTS "course_lessons_chapter_id_course_chapters_id_fk";--> statement-breakpoint
ALTER TABLE "course_chapters" DROP CONSTRAINT IF EXISTS "course_chapters_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "course_chapters" RENAME TO "course_sections";--> statement-breakpoint
ALTER TABLE "course_lessons" RENAME COLUMN "chapter_id" TO "section_id";--> statement-breakpoint
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE set null ON UPDATE no action;
