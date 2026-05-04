import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { courses } from './courses';

/**
 * Bảng chương học (Course Sections)
 * Chia khóa học thành các chương/phần lớn.
 */
export const courseSections = pgTable('course_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Liên kết với khóa học
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  
  // Tiêu đề chương (Ví dụ: "Chương 1: Giới thiệu tổng quan")
  title: text('title').notNull(),
  
  // Mô tả ngắn về chương
  description: text('description'),
  
  // Thứ tự hiển thị của chương (Ví dụ: 1, 2, 3...)
  position: integer('position').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type CourseSection = typeof courseSections.$inferSelect;
export type NewCourseSection = typeof courseSections.$inferInsert;
