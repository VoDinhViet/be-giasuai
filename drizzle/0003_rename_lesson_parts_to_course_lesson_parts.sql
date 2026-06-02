ALTER TYPE IF EXISTS "public"."lesson_part_type" RENAME TO "course_lesson_part_type";--> statement-breakpoint
ALTER TABLE IF EXISTS "lesson_parts" RENAME TO "course_lesson_parts";--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.course_lesson_parts') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.course_lesson_parts'::regclass
        AND conname = 'lesson_parts_lesson_id_course_lessons_id_fk'
    ) THEN
    ALTER TABLE "course_lesson_parts" RENAME CONSTRAINT "lesson_parts_lesson_id_course_lessons_id_fk" TO "course_lesson_parts_lesson_id_course_lessons_id_fk";
  END IF;
END $$;--> statement-breakpoint
