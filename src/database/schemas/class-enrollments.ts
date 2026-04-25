import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { users } from './users';

export const classEnrollmentStatusEnum = pgEnum('class_enrollment_status', [
  'active',
  'completed',
  'dropped',
]);

export const classEnrollments = pgTable(
  'class_enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    status: classEnrollmentStatusEnum('status').default('active').notNull(),
  },
  (table) => ({
    classStudentUnique: uniqueIndex(
      'class_enrollments_class_student_unique',
    ).on(table.classId, table.studentId),
  }),
);

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type NewClassEnrollment = typeof classEnrollments.$inferInsert;
