import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { classCourses } from './class-courses';
import { classRegistrations } from './class-registrations';
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

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  courses: many(classCourses),
  registrations: many(classRegistrations),
}));

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
