import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { courses } from '../courses/courses';
import { courseSections } from '../courses/course-sections';
import { lessonParts } from './lesson-parts';

export const lessonStatusEnum = pgEnum('course_lesson_status', [
  'PUBLISHED',
  'DRAFT',
  'LOCKED',
]);

export const lessonTypeEnum = pgEnum('course_lesson_type', [
  'VIDEO',
  'READING',
  'EXERCISE',
  'WORKSHOP',
  'QUIZ',
  'RESOURCE',
]);

export const lessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').references(() => courseSections.id, {
    onDelete: 'set null',
  }),
  code: varchar('code', { length: 32 }).notNull(),
  title: text('title').notNull(),
  durationMinutes: integer('duration_minutes').default(0).notNull(),
  type: lessonTypeEnum('type').default('VIDEO').notNull(),
  status: lessonStatusEnum('status').default('DRAFT').notNull(),
  resourceCount: integer('resource_count').default(0).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const lessonsRelations = relations(lessons, ({ many, one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  section: one(courseSections, {
    fields: [lessons.sectionId],
    references: [courseSections.id],
  }),
  parts: many(lessonParts),
}));

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
