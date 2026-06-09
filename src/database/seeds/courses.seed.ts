import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schemas';
import {
  courseAssignments,
  courseEnrollments,
  lessonParts as lessonPartTable,
  lessons as lessonTable,
  courseObjectives,
  courses,
  courseSections,
  userProfiles,
  users,
} from '../schemas';
import { classCourses, classSessions } from '../schemas/classes';
import { hashPassword } from '../../utils/password.util';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const demoInstructor = {
  email: 'instructor@giasuai.com',
  username: 'instructor',
  fullName: 'Demo Instructor',
  password: '123456',
};

const demoCourse = {
  code: 'AI-TUTOR-FOUNDATION',
  name: 'Nền tảng học cùng Gia Sư AI',
  category: 'Kỹ năng học tập',
  description:
    'Khóa học hướng dẫn học viên dùng Gia Sư AI để lập kế hoạch học tập, luyện bài và theo dõi tiến độ một cách có hệ thống.',
  audience: 'Học viên THCS, THPT muốn cải thiện hiệu quả tự học với AI',
  level: 'ALL_LEVELS' as const,
  durationMinutes: 420,
  startDate: '2026-07-01',
  status: 'PUBLISHED' as const,
};

async function main() {
  const client = postgres(databaseUrl!);
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding demo course...');

    await db.transaction(async (tx) => {
      await tx.update(classSessions).set({ courseId: null });
      await tx.delete(classCourses);
      await tx.delete(courseAssignments);
      await tx.delete(courseEnrollments);
      await tx.delete(lessonPartTable);
      await tx.delete(lessonTable);
      await tx.delete(courseObjectives);
      await tx.delete(courseSections);
      await tx.delete(courses);

      const hashedPassword = await hashPassword(demoInstructor.password);
      const [author] = await tx
        .insert(users)
        .values({
          email: demoInstructor.email,
          username: demoInstructor.username,
          fullName: demoInstructor.fullName,
          password: hashedPassword,
          role: 'INSTRUCTOR',
          isLocked: false,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            username: demoInstructor.username,
            fullName: demoInstructor.fullName,
            password: hashedPassword,
            role: 'INSTRUCTOR',
            isLocked: false,
            updatedAt: new Date(),
          },
        })
        .returning();

      await tx
        .insert(userProfiles)
        .values({
          userId: author.id,
          bio: 'Giảng viên demo cho dữ liệu khóa học mẫu.',
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            bio: 'Giảng viên demo cho dữ liệu khóa học mẫu.',
            updatedAt: new Date(),
          },
        });

      const [course] = await tx
        .insert(courses)
        .values({
          ...demoCourse,
          authorId: author.id,
        })
        .returning();

      await tx.insert(courseObjectives).values([
        {
          courseId: course.id,
          content: 'Biết cách đặt mục tiêu học tập rõ ràng với Gia Sư AI.',
          position: 1,
        },
        {
          courseId: course.id,
          content: 'Xây dựng kế hoạch học theo tuần và theo dõi tiến độ.',
          position: 2,
        },
        {
          courseId: course.id,
          content: 'Luyện bài, nhận phản hồi và cải thiện kết quả học tập.',
          position: 3,
        },
      ]);

      const sections = await tx
        .insert(courseSections)
        .values([
          {
            courseId: course.id,
            code: 'AI-TUTOR-FOUNDATION-S01',
            title: 'Làm quen với Gia Sư AI',
            position: 1,
          },
          {
            courseId: course.id,
            code: 'AI-TUTOR-FOUNDATION-S02',
            title: 'Lập kế hoạch học tập',
            position: 2,
          },
          {
            courseId: course.id,
            code: 'AI-TUTOR-FOUNDATION-S03',
            title: 'Luyện tập và đánh giá tiến độ',
            position: 3,
          },
        ])
        .returning();

      const sectionByCode = new Map(
        sections.map((section) => [section.code, section.id]),
      );

      const lessonRows = await tx
        .insert(lessonTable)
        .values([
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S01'),
            code: 'AI-TUTOR-FOUNDATION-L01',
            title: 'Tổng quan khóa học và cách học hiệu quả',
            durationMinutes: 35,
            type: 'VIDEO',
            status: 'PUBLISHED',
            resourceCount: 2,
            position: 1,
          },
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S01'),
            code: 'AI-TUTOR-FOUNDATION-L02',
            title: 'Cách đặt câu hỏi để AI phản hồi đúng trọng tâm',
            durationMinutes: 45,
            type: 'READING',
            status: 'PUBLISHED',
            resourceCount: 3,
            position: 2,
          },
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S02'),
            code: 'AI-TUTOR-FOUNDATION-L03',
            title: 'Thiết lập mục tiêu học theo tuần',
            durationMinutes: 50,
            type: 'WORKSHOP',
            status: 'PUBLISHED',
            resourceCount: 2,
            position: 1,
          },
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S02'),
            code: 'AI-TUTOR-FOUNDATION-L04',
            title: 'Xây dựng lịch ôn tập cá nhân',
            durationMinutes: 60,
            type: 'EXERCISE',
            status: 'PUBLISHED',
            resourceCount: 1,
            position: 2,
          },
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S03'),
            code: 'AI-TUTOR-FOUNDATION-L05',
            title: 'Luyện bài và nhận phản hồi từ AI',
            durationMinutes: 75,
            type: 'EXERCISE',
            status: 'PUBLISHED',
            resourceCount: 3,
            position: 1,
          },
          {
            courseId: course.id,
            sectionId: sectionByCode.get('AI-TUTOR-FOUNDATION-S03'),
            code: 'AI-TUTOR-FOUNDATION-L06',
            title: 'Đánh giá tiến độ và điều chỉnh kế hoạch',
            durationMinutes: 55,
            type: 'QUIZ',
            status: 'PUBLISHED',
            resourceCount: 2,
            position: 2,
          },
        ])
        .returning();

      const lessonByCode = new Map(
        lessonRows.map((lesson) => [lesson.code, lesson.id]),
      );

      const lessonPartFiles = [
        ['AI-TUTOR-FOUNDATION-L01', 'Mục tiêu của khóa học', 1],
        ['AI-TUTOR-FOUNDATION-L01', 'Cách học từng buổi', 2],
        ['AI-TUTOR-FOUNDATION-L02', 'Câu hỏi tốt cần có gì', 1],
        ['AI-TUTOR-FOUNDATION-L02', 'Ví dụ hỏi lại khi chưa hiểu', 2],
        ['AI-TUTOR-FOUNDATION-L03', 'Chọn mục tiêu vừa sức', 1],
        ['AI-TUTOR-FOUNDATION-L03', 'Mẫu mục tiêu học tập', 2],
        ['AI-TUTOR-FOUNDATION-L04', 'Chia nhỏ thời gian ôn tập', 1],
        ['AI-TUTOR-FOUNDATION-L04', 'Thực hành tạo lịch 7 ngày', 2],
        ['AI-TUTOR-FOUNDATION-L05', 'Gửi bài làm để nhận phản hồi', 1],
        ['AI-TUTOR-FOUNDATION-L05', 'Tự sửa trước khi xem đáp án', 2],
        ['AI-TUTOR-FOUNDATION-L06', 'Đọc lại tiến độ tuần', 1],
        ['AI-TUTOR-FOUNDATION-L06', 'Quiz tự đánh giá', 2],
      ] as const;

      const lessonPartRows = await tx
        .insert(lessonPartTable)
        .values(
          lessonPartFiles.map(([lessonCode, title, position], index) => {
            const originalName = `${lessonCode.toLowerCase()}-theory-${position}.pdf`;

            return {
              lessonId: lessonByCode.get(lessonCode)!,
              title,
              type: 'TEXT' as const,
              fileUrl: `/uploads/demo-course/${originalName}`,
              originalName,
              mimeType: 'application/pdf',
              sizeBytes: 180_000 + index * 12_000,
              position,
              isPublished: true,
            };
          }),
        )
        .returning();

      await tx.insert(courseAssignments).values([
        {
          courseId: course.id,
          lessonId: lessonByCode.get('AI-TUTOR-FOUNDATION-L04'),
          code: 'AI-TUTOR-FOUNDATION-ASM01',
          title: 'Nộp kế hoạch học tập 7 ngày',
          type: 'EXERCISE',
          dueAt: new Date('2026-07-10T17:00:00.000Z'),
          submissionCount: 18,
          gradedCount: 12,
          averageScore: '8.20',
          status: 'GRADING',
        },
        {
          courseId: course.id,
          lessonId: lessonByCode.get('AI-TUTOR-FOUNDATION-L06'),
          code: 'AI-TUTOR-FOUNDATION-ASM02',
          title: 'Quiz tổng kết khóa học',
          type: 'QUIZ',
          dueAt: new Date('2026-07-20T17:00:00.000Z'),
          submissionCount: 10,
          gradedCount: 10,
          averageScore: '8.75',
          status: 'GRADED',
        },
      ]);

      console.log(`Seeded course: ${course.code}`);
      console.log(`Sections: ${sections.length}`);
      console.log(`Lessons: ${lessonRows.length}`);
      console.log(`Lesson parts: ${lessonPartRows.length}`);
    });
  } catch (error) {
    console.error('Failed to seed demo course');
    console.error(error);
  } finally {
    await client.end();
  }
}

void main();
