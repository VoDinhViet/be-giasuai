import { relations } from 'drizzle-orm';
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { courseLessons } from './course-lessons';

export const courseAssignmentStatusEnum = pgEnum('course_assignment_status', [
  'OPEN',
  'GRADING',
  'GRADED',
  'DRAFT',
]);

export const courseAssignmentTypeEnum = pgEnum('course_assignment_type', [
  'EXERCISE',
  'QUIZ',
  'PROJECT',
]);

export const courseAssignments = pgTable('course_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').references(() => courseLessons.id, {
    onDelete: 'set null',
  }),
  code: varchar('code', { length: 32 }).notNull(),
  title: text('title').notNull(),
  type: courseAssignmentTypeEnum('type').default('EXERCISE').notNull(),
  dueAt: timestamp('due_at'),
  submissionCount: integer('submission_count').default(0).notNull(),
  gradedCount: integer('graded_count').default(0).notNull(),
  averageScore: decimal('average_score', { precision: 4, scale: 2 })
    .default('0')
    .notNull(),
  status: courseAssignmentStatusEnum('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const courseAssignmentsRelations = relations(
  courseAssignments,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseAssignments.courseId],
      references: [courses.id],
    }),
    lesson: one(courseLessons, {
      fields: [courseAssignments.lessonId],
      references: [courseLessons.id],
    }),
  }),
);

export type CourseAssignment = typeof courseAssignments.$inferSelect;
export type NewCourseAssignment = typeof courseAssignments.$inferInsert;
