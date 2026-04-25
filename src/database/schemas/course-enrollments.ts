import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { courses } from './courses';
import { users } from './users';

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
]);

export const courseEnrollments = pgTable(
  'course_enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: enrollmentStatusEnum('status').default('ACTIVE').notNull(),
    progressPercent: integer('progress_percent').default(0).notNull(),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    courseStudentUnique: uniqueIndex(
      'course_enrollments_course_student_unique',
    ).on(table.courseId, table.studentId),
  }),
);

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type NewCourseEnrollment = typeof courseEnrollments.$inferInsert;
