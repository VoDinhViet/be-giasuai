import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { courseLessons } from './course-lessons';

export const courseLessonPartTypeEnum = pgEnum('course_lesson_part_type', [
  'PDF',
  'DOCX',
]);

/**
 * Bảng phần bài học (Lesson Parts / Sessions)
 * Các tài liệu, phiên học nhỏ nằm trong một bài học.
 */
export const courseLessonParts = pgTable('course_lesson_parts', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Liên kết với bài học
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => courseLessons.id, { onDelete: 'cascade' }),

  // Tiêu đề phần học (Ví dụ: "Tài liệu hướng dẫn thực hành")
  title: text('title').notNull(),

  // Loại tài liệu (PDF hoặc DOCX)
  partType: courseLessonPartTypeEnum('part_type').notNull(),

  // Link tải hoặc xem tài liệu
  fileUrl: text('file_url').notNull(),

  // Thứ tự hiển thị trong bài học
  position: integer('position').notNull(),

  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const courseLessonPartsRelations = relations(
  courseLessonParts,
  ({ one }) => ({
    lesson: one(courseLessons, {
      fields: [courseLessonParts.lessonId],
      references: [courseLessons.id],
    }),
  }),
);

export type CourseLessonPart = typeof courseLessonParts.$inferSelect;
export type NewCourseLessonPart = typeof courseLessonParts.$inferInsert;
