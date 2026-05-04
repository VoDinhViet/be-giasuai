import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { lessons } from './lessons';

export const lessonPartTypeEnum = pgEnum('lesson_part_type', ['PDF', 'DOCX']);

/**
 * Bảng phần bài học (Lesson Parts / Sessions)
 * Các tài liệu, phiên học nhỏ nằm trong một bài học.
 */
export const lessonParts = pgTable('lesson_parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Liên kết với bài học
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  
  // Tiêu đề phần học (Ví dụ: "Tài liệu hướng dẫn thực hành")
  title: text('title').notNull(),
  
  // Loại tài liệu (PDF hoặc DOCX)
  partType: lessonPartTypeEnum('part_type').notNull(),
  
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

export type LessonPart = typeof lessonParts.$inferSelect;
export type NewLessonPart = typeof lessonParts.$inferInsert;
