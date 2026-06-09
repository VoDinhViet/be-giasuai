import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../users';
import { classCourses } from '../classes/class-courses';
import { courseAssignments } from './course-assignments';
import { courseSections } from './course-sections';
import { courseEnrollments } from './course-enrollments';
import { lessons } from '../lessons/lessons';
import { courseObjectives } from './course-objectives';

export const courseStatusEnum = pgEnum('course_status', [
  'PUBLISHED',
  'DRAFT',
  'ARCHIVED',
]);

export const courseLevelEnum = pgEnum('course_level', [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'ALL_LEVELS',
]);

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 32 }).notNull(),
    name: text('name').notNull(),
    category: varchar('category', { length: 120 }).notNull(),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    description: text('description'),
    audience: text('audience'),
    level: courseLevelEnum('level').default('BEGINNER').notNull(),
    durationMinutes: integer('duration_minutes').default(0).notNull(),
    startDate: date('start_date'),
    status: courseStatusEnum('status').default('DRAFT').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex('courses_code_unique').on(table.code)],
);

export const coursesRelations = relations(courses, ({ many, one }) => ({
  author: one(users, {
    fields: [courses.authorId],
    references: [users.id],
  }),
  sections: many(courseSections),
  objectives: many(courseObjectives),
  lessons: many(lessons),
  assignments: many(courseAssignments),
  enrollments: many(courseEnrollments),
  classCourses: many(classCourses),
}));

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
