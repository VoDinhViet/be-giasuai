ALTER TABLE IF EXISTS "lessons" RENAME TO "course_lessons";--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.course_lessons') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.course_lessons'::regclass
        AND conname = 'lessons_section_id_course_sections_id_fk'
    ) THEN
    ALTER TABLE "course_lessons" RENAME CONSTRAINT "lessons_section_id_course_sections_id_fk" TO "course_lessons_section_id_course_sections_id_fk";
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.lesson_parts') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.lesson_parts'::regclass
        AND conname = 'lesson_parts_lesson_id_lessons_id_fk'
    ) THEN
    ALTER TABLE "lesson_parts" RENAME CONSTRAINT "lesson_parts_lesson_id_lessons_id_fk" TO "lesson_parts_lesson_id_course_lessons_id_fk";
  END IF;
END $$;--> statement-breakpoint
