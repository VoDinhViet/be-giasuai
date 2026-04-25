import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { courseLessons } from './course-lessons';
import { users } from './users';

export const lessonProgressStatusEnum = pgEnum('lesson_progress_status', [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: lessonProgressStatusEnum('status').default('NOT_STARTED').notNull(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    lastAccessedAt: timestamp('last_accessed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    lessonStudentUnique: uniqueIndex(
      'lesson_progress_lesson_student_unique',
    ).on(table.lessonId, table.studentId),
  }),
);

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;
