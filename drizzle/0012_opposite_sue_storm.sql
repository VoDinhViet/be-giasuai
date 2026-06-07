CREATE TYPE "public"."class_enrollment_source" AS ENUM('CODE', 'INVITE');--> statement-breakpoint
CREATE TYPE "public"."class_session_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."class_attendance_status" AS ENUM('PRESENT', 'LATE', 'ABSENT');--> statement-breakpoint
ALTER TYPE "public"."class_enrollment_status" ADD VALUE 'PENDING' BEFORE 'ACTIVE';--> statement-breakpoint
ALTER TYPE "public"."class_enrollment_status" ADD VALUE 'REJECTED';--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"course_id" uuid,
	"teacher_id" uuid,
	"code" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"session_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"room" varchar(120),
	"status" "class_session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "class_attendance_status" DEFAULT 'PRESENT' NOT NULL,
	"note" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD COLUMN "source" "class_enrollment_source" DEFAULT 'CODE' NOT NULL;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_attendance_records" ADD CONSTRAINT "class_attendance_records_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_attendance_records" ADD CONSTRAINT "class_attendance_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "class_sessions_class_code_unique" ON "class_sessions" USING btree ("class_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "class_attendance_session_student_unique" ON "class_attendance_records" USING btree ("session_id","student_id");