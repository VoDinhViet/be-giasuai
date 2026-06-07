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
import { courses } from './courses';
import { courseChapters } from './course-chapters';

export const courseLessonStatusEnum = pgEnum('course_lesson_status', [
  'PUBLISHED',
  'DRAFT',
  'LOCKED',
]);

export const courseLessonTypeEnum = pgEnum('course_lesson_type', [
  'VIDEO',
  'READING',
  'EXERCISE',
  'WORKSHOP',
  'QUIZ',
  'RESOURCE',
]);

export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  chapterId: uuid('chapter_id').references(() => courseChapters.id, {
    onDelete: 'set null',
  }),
  code: varchar('code', { length: 32 }).notNull(),
  title: text('title').notNull(),
  durationMinutes: integer('duration_minutes').default(0).notNull(),
  type: courseLessonTypeEnum('type').default('VIDEO').notNull(),
  status: courseLessonStatusEnum('status').default('DRAFT').notNull(),
  resourceCount: integer('resource_count').default(0).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const courseLessonsRelations = relations(courseLessons, ({ one }) => ({
  course: one(courses, {
    fields: [courseLessons.courseId],
    references: [courses.id],
  }),
  chapter: one(courseChapters, {
    fields: [courseLessons.chapterId],
    references: [courseChapters.id],
  }),
}));

export type CourseLesson = typeof courseLessons.$inferSelect;
export type NewCourseLesson = typeof courseLessons.$inferInsert;
