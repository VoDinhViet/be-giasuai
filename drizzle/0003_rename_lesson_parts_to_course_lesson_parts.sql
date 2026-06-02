DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_namespace.nspname = 'public'
      AND pg_type.typname = 'lesson_part_type'
  )
    AND NOT EXISTS (
      SELECT 1
      FROM pg_type
      JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE pg_namespace.nspname = 'public'
        AND pg_type.typname = 'course_lesson_part_type'
    ) THEN
    ALTER TYPE "public"."lesson_part_type" RENAME TO "course_lesson_part_type";
  END IF;
END $$;--> statement-breakpoint
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
