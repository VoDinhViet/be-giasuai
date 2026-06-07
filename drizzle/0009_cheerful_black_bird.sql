CREATE TABLE "course_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_lessons" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "course_chapters" ADD CONSTRAINT "course_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_chapter_id_course_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."course_chapters"("id") ON DELETE set null ON UPDATE no action;