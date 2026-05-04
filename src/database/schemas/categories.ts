import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export enum CategoryType {
  LEVEL = 'LEVEL',
  GRADE = 'GRADE',
  MAJOR = 'MAJOR',
  SUBJECT = 'SUBJECT',
}

export const categoryTypeEnum = pgEnum('category_type', [
  CategoryType.LEVEL,
  CategoryType.GRADE,
  CategoryType.MAJOR,
  CategoryType.SUBJECT,
]);

/**
 * Bảng danh mục học thuật (Categories)
 * Gộp tất cả các loại danh mục: Cấp học, Khối lớp, Chuyên ngành, Môn học.
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Liên kết với danh mục cha (Ví dụ: Khối lớp thuộc về Cấp học)
  parentId: uuid('parent_id').references((): any => categories.id, {
    onDelete: 'cascade',
  }),
  
  // Loại danh mục
  type: categoryTypeEnum('type').notNull(),
  
  // Mã danh mục (Ví dụ: PRIMARY, GRADE_1, MATH)
  code: text('code').notNull().unique(),
  
  // Tên hiển thị
  name: text('name').notNull(),
  
  // Mô tả ngắn
  description: text('description'),
  
  // Thứ tự hiển thị
  sortOrder: integer('sort_order').default(0).notNull(),
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
