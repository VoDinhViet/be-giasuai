import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { courseSections } from './course-sections';

export const lessonTypeEnum = pgEnum('lesson_type', [
  'VIDEO',
  'READING',
  'QUIZ',
  'ASSIGNMENT',
  'LIVE_SESSION',
]);

export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => courseSections.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary'),
  content: text('content'),
  videoUrl: text('video_url'),
  lessonType: lessonTypeEnum('lesson_type').default('READING').notNull(),
  durationMinutes: integer('duration_minutes').default(0).notNull(),
  position: integer('position').notNull(),
  isPreview: boolean('is_preview').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type CourseLesson = typeof courseLessons.$inferSelect;
export type NewCourseLesson = typeof courseLessons.$inferInsert;
