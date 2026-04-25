import {
  integer,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const courseLevelEnum = pgEnum('course_level', [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'ALL_LEVELS',
]);

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  thumbnailUrl: text('thumbnail_url'),
  introVideoUrl: text('intro_video_url'),
  teacherId: uuid('teacher_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  level: courseLevelEnum('level').default('ALL_LEVELS').notNull(),
  price: integer('price').default(0).notNull(),
  estimatedDurationMinutes: integer('estimated_duration_minutes')
    .default(0)
    .notNull(),
  tags: text('tags').array().default([]).notNull(),
  learningOutcomes: text('learning_outcomes').array().default([]).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
