CREATE TYPE "public"."course_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('PUBLISHED', 'DRAFT', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."course_lesson_status" AS ENUM('PUBLISHED', 'DRAFT', 'LOCKED');--> statement-breakpoint
CREATE TYPE "public"."course_lesson_type" AS ENUM('VIDEO', 'READING', 'EXERCISE', 'WORKSHOP', 'QUIZ', 'RESOURCE');--> statement-breakpoint
CREATE TYPE "public"."course_assignment_status" AS ENUM('OPEN', 'GRADING', 'GRADED', 'DRAFT');--> statement-breakpoint
CREATE TYPE "public"."course_assignment_type" AS ENUM('EXERCISE', 'QUIZ', 'PROJECT');--> statement-breakpoint
CREATE TYPE "public"."course_enrollment_status" AS ENUM('ACTIVE', 'COMPLETED', 'DROPPED');--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"category" varchar(120) NOT NULL,
	"instructor_id" uuid,
	"description" text,
	"audience" text,
	"level" "course_level" DEFAULT 'BEGINNER' NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"start_date" date,
	"status" "course_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"content" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"type" "course_lesson_type" DEFAULT 'VIDEO' NOT NULL,
	"status" "course_lesson_status" DEFAULT 'DRAFT' NOT NULL,
	"resource_count" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"lesson_id" uuid,
	"code" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"type" "course_assignment_type" DEFAULT 'EXERCISE' NOT NULL,
	"due_at" timestamp,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"graded_count" integer DEFAULT 0 NOT NULL,
	"average_score" numeric(4, 2) DEFAULT '0' NOT NULL,
	"status" "course_assignment_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"status" "course_enrollment_status" DEFAULT 'ACTIVE' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_objectives" ADD CONSTRAINT "course_objectives_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_code_unique" ON "courses" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "course_enrollments_course_student_unique" ON "course_enrollments" USING btree ("course_id","student_id");