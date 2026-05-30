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

import { courseSections } from './course-sections';
import { lessonParts } from './lesson-parts';
import { lessonResources } from './lesson-resources';

/**
 * Bảng bài học (Lessons)
 * Các bài học chi tiết nằm trong từng chương.
 */
export const lessons = pgTable('lessons', {
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

export const lessonsRelations = relations(lessons, ({ many, one }) => ({
  section: one(courseSections, {
    fields: [lessons.sectionId],
    references: [courseSections.id],
  }),
  lessonParts: many(lessonParts),
  resources: many(lessonResources),
}));

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
