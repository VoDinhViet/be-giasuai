import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const schoolLevels = pgTable('school_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const grades = pgTable('grades', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolLevelId: uuid('school_level_id')
    .notNull()
    .references(() => schoolLevels.id, {
      onDelete: 'cascade',
    }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const majors = pgTable('majors', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolLevelId: uuid('school_level_id')
    .notNull()
    .references(() => schoolLevels.id, {
      onDelete: 'cascade',
    }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const gradeSubjects = pgTable(
  'grade_subjects',
  {
    gradeId: uuid('grade_id')
      .notNull()
      .references(() => grades.id, {
        onDelete: 'cascade',
      }),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, {
        onDelete: 'cascade',
      }),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.gradeId, table.subjectId] })],
);

export const majorSubjects = pgTable(
  'major_subjects',
  {
    majorId: uuid('major_id')
      .notNull()
      .references(() => majors.id, {
        onDelete: 'cascade',
      }),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, {
        onDelete: 'cascade',
      }),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.majorId, table.subjectId] })],
);

export type SchoolLevel = typeof schoolLevels.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Major = typeof majors.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
