CREATE TYPE "public"."class_status" AS ENUM('ACTIVE', 'UPCOMING', 'COMPLETED', 'PAUSED');--> statement-breakpoint
CREATE TYPE "public"."class_enrollment_status" AS ENUM('ACTIVE', 'COMPLETED', 'DROPPED');--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"course_id" uuid,
	"teacher_id" uuid,
	"max_students" integer DEFAULT 0 NOT NULL,
	"schedule" varchar(160),
	"room" varchar(120),
	"start_date" date,
	"end_date" date,
	"status" "class_status" DEFAULT 'UPCOMING' NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "class_enrollment_status" DEFAULT 'ACTIVE' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "classes_code_unique" ON "classes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "class_enrollments_class_student_unique" ON "class_enrollments" USING btree ("class_id","student_id");