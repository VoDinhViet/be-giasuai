import {
  integer,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../users';
import { categories } from '../categories';

export const courseLevelEnum = pgEnum('course_level', [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'ALL_LEVELS',
]);

/**
 * Bảng khóa học (Courses)
 * Lưu trữ thông tin tổng quan về một khóa học.
 */
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Tiêu đề khóa học (Ví dụ: "Lập trình React cơ bản")
  title: text('title').notNull(),
  
  // Đường dẫn thân thiện (Ví dụ: "lap-trinh-react-co-ban")
  slug: text('slug').notNull().unique(),
  
  // Mô tả chi tiết về khóa học
  description: text('description'),
  
  // Link ảnh đại diện khóa học
  thumbnailUrl: text('thumbnail_url'),
  
  // Các từ khóa tìm kiếm (Ví dụ: ["react", "frontend", "javascript"])
  tags: text('tags').array().default([]).notNull(),
  
  // Mục tiêu/Kết quả học tập (Ví dụ: ["Biết cách sử dụng Hook", "Hiểu về Virtual DOM"])
  learningOutcomes: text('learning_outcomes').array().default([]).notNull(),
  
  // Liên kết với Danh mục học thuật (Categories)
  levelId: uuid('level_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  gradeId: uuid('grade_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  majorId: uuid('major_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  subjectId: uuid('subject_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  
  // Trạng thái công khai của khóa học
  isPublished: boolean('is_published').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
