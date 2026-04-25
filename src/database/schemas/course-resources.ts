import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { courseLessons } from './course-lessons';

export const resourceTypeEnum = pgEnum('resource_type', [
  'FILE',
  'LINK',
  'IMAGE',
  'AUDIO',
  'VIDEO',
  'DOCUMENT',
]);

export const courseResources = pgTable('course_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => courseLessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  resourceType: resourceTypeEnum('resource_type').default('LINK').notNull(),
  resourceUrl: text('resource_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CourseResource = typeof courseResources.$inferSelect;
export type NewCourseResource = typeof courseResources.$inferInsert;
