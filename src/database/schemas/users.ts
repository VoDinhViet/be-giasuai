import { relations } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sessions } from './sessions';
import { userProfiles } from './user-profiles';

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'STUDENT',
  'TEACHER',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('STUDENT').notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
