import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { lessons } from './lessons';

export const lessonPartTypeEnum = pgEnum('course_lesson_part_type', [
  'TEXT',
  'VIDEO',
  'EXERCISE',
  'QUIZ',
  'RESOURCE',
]);

export const lessonParts = pgTable('course_lesson_parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: lessonPartTypeEnum('type').default('TEXT').notNull(),
  fileUrl: text('file_url').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').default(0).notNull(),
  position: integer('position').default(0).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const lessonPartsRelations = relations(lessonParts, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonParts.lessonId],
    references: [lessons.id],
  }),
}));

export type LessonPart = typeof lessonParts.$inferSelect;
export type NewLessonPart = typeof lessonParts.$inferInsert;
