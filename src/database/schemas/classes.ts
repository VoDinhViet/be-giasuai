import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  inviteCode: text('invite_code').notNull().unique(),
  teacherId: uuid('teacher_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
