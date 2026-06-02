import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { courseSections } from './course-sections';
import { courseLessonParts } from './course-lesson-parts';

/**
 * Bảng bài học (Course Lessons)
 * Các bài học chi tiết nằm trong từng chương.
 */
export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Liên kết với chương học
  sectionId: uuid('section_id')
    .notNull()
    .references(() => courseSections.id, { onDelete: 'cascade' }),

  // Tiêu đề bài học (Ví dụ: "Bài 1: Cài đặt môi trường")
  title: text('title').notNull(),

  // Thời lượng ước tính (phút)
  durationMinutes: integer('duration_minutes').default(0).notNull(),

  // Thứ tự hiển thị trong chương
  position: integer('position').notNull(),

  // Các cờ trạng thái
  isPreview: boolean('is_preview').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const courseLessonsRelations = relations(
  courseLessons,
  ({ many, one }) => ({
    section: one(courseSections, {
      fields: [courseLessons.sectionId],
      references: [courseSections.id],
    }),
    courseLessonParts: many(courseLessonParts),
  }),
);

export type CourseLesson = typeof courseLessons.$inferSelect;
export type NewCourseLesson = typeof courseLessons.$inferInsert;
