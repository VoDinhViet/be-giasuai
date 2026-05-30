import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { lessons } from './lessons';

export const resourceTypeEnum = pgEnum('resource_type', [
  'FILE',
  'LINK',
  'IMAGE',
  'AUDIO',
  'VIDEO',
  'DOCUMENT',
]);

export const lessonResources = pgTable('lesson_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  resourceType: resourceTypeEnum('resource_type').default('LINK').notNull(),
  resourceUrl: text('resource_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessonResourcesRelations = relations(
  lessonResources,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonResources.lessonId],
      references: [lessons.id],
    }),
  }),
);

export type LessonResource = typeof lessonResources.$inferSelect;
export type NewLessonResource = typeof lessonResources.$inferInsert;
