import { relations } from 'drizzle-orm';
import { classes } from './classes';
import { classCourses } from './class-courses';
import { classEnrollments } from './class-enrollments';
import { users } from './users';
import { sessions } from './sessions';
import { courses } from './courses/courses';
import { courseSections } from './courses/course-sections';
import { lessons } from './courses/lessons';
import { lessonParts } from './courses/lesson-parts';
import { lessonResources } from './courses/lesson-resources';
import { categories } from './categories';

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedClassCourses: many(classCourses),
  classEnrollments: many(classEnrollments),
  teachingClasses: many(classes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  courses: many(classCourses),
  enrollments: many(classEnrollments),
}));

export const classCoursesRelations = relations(classCourses, ({ one }) => ({
  class: one(classes, {
    fields: [classCourses.classId],
    references: [classes.id],
  }),
  course: one(courses, {
    fields: [classCourses.courseId],
    references: [courses.id],
  }),
  assignedByUser: one(users, {
    fields: [classCourses.assignedBy],
    references: [users.id],
  }),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classEnrollments.studentId],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  classes: many(classCourses),
  courseSections: many(courseSections),
  level: one(categories, {
    fields: [courses.levelId],
    references: [categories.id],
  }),
  grade: one(categories, {
    fields: [courses.gradeId],
    references: [categories.id],
  }),
  major: one(categories, {
    fields: [courses.majorId],
    references: [categories.id],
  }),
  subject: one(categories, {
    fields: [courses.subjectId],
    references: [categories.id],
  }),
}));

export const courseSectionsRelations = relations(
  courseSections,
  ({ many, one }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    lessons: many(lessons),
  }),
);

export const lessonsRelations = relations(
  lessons,
  ({ many, one }) => ({
    section: one(courseSections, {
      fields: [lessons.sectionId],
      references: [courseSections.id],
    }),
    lessonParts: many(lessonParts),
    resources: many(lessonResources),
  }),
);

export const lessonPartsRelations = relations(lessonParts, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonParts.lessonId],
    references: [lessons.id],
  }),
}));

export const lessonResourcesRelations = relations(
  lessonResources,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonResources.lessonId],
      references: [lessons.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent',
  }),
  children: many(categories, {
    relationName: 'category_parent',
  }),
}));
