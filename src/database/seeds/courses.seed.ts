import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../schemas';
import {
  courseAssignments,
  courseLessons,
  courseObjectives,
  courses,
} from '../schemas';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const fakeCourses = [
  {
    code: 'CRS-001',
    name: 'Toán nền tảng cho THCS',
    category: 'Toán học',
    description:
      'Củng cố kiến thức số học, đại số và hình học cho học viên THCS.',
    audience: 'Học viên lớp 6-9 cần lấy lại gốc Toán',
    level: 'BEGINNER' as const,
    durationMinutes: 960,
    startDate: '2026-06-10',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-002',
    name: 'Luyện thi Toán vào lớp 10',
    category: 'Luyện thi',
    description:
      'Lộ trình luyện đề, ôn chuyên đề trọng tâm và rèn tốc độ làm bài.',
    audience: 'Học viên lớp 9 chuẩn bị thi tuyển sinh lớp 10',
    level: 'INTERMEDIATE' as const,
    durationMinutes: 1440,
    startDate: '2026-06-18',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-003',
    name: 'Tiếng Anh giao tiếp cho học sinh',
    category: 'Tiếng Anh',
    description:
      'Tăng phản xạ nghe nói, vốn từ học đường và sự tự tin khi giao tiếp.',
    audience: 'Học viên THCS, THPT muốn cải thiện giao tiếp',
    level: 'BEGINNER' as const,
    durationMinutes: 900,
    startDate: '2026-06-22',
    status: 'DRAFT' as const,
  },
  {
    code: 'CRS-004',
    name: 'Ngữ pháp tiếng Anh trọng tâm',
    category: 'Tiếng Anh',
    description:
      'Hệ thống hóa ngữ pháp thường gặp trong bài kiểm tra và kỳ thi.',
    audience: 'Học viên cần cải thiện điểm tiếng Anh trên lớp',
    level: 'INTERMEDIATE' as const,
    durationMinutes: 720,
    startDate: '2026-07-01',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-005',
    name: 'Vật lý cơ bản lớp 10',
    category: 'Vật lý',
    description:
      'Làm quen tư duy vật lý, công thức nền và phương pháp giải bài tập.',
    audience: 'Học viên lớp 10 mới chuyển cấp',
    level: 'BEGINNER' as const,
    durationMinutes: 780,
    startDate: '2026-07-05',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-006',
    name: 'Hóa học mất gốc',
    category: 'Hóa học',
    description:
      'Ôn lại hóa trị, phương trình phản ứng và dạng bài tính toán cơ bản.',
    audience: 'Học viên THCS, THPT mất gốc Hóa',
    level: 'BEGINNER' as const,
    durationMinutes: 840,
    startDate: '2026-07-08',
    status: 'DRAFT' as const,
  },
  {
    code: 'CRS-007',
    name: 'Lập trình Python nhập môn',
    category: 'Tin học',
    description:
      'Học cú pháp Python, tư duy thuật toán và bài tập thực hành nhỏ.',
    audience: 'Học viên mới bắt đầu lập trình',
    level: 'BEGINNER' as const,
    durationMinutes: 1080,
    startDate: '2026-07-12',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-008',
    name: 'Tư duy giải toán nâng cao',
    category: 'Toán học',
    description:
      'Rèn chiến lược phân tích đề, biến đổi và trình bày lời giải nâng cao.',
    audience: 'Học viên khá giỏi muốn bứt phá điểm số',
    level: 'ADVANCED' as const,
    durationMinutes: 1260,
    startDate: '2026-07-16',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-009',
    name: 'Kỹ năng tự học hiệu quả',
    category: 'Kỹ năng học tập',
    description:
      'Xây dựng lịch học, ghi chú, ôn tập giãn cách và tự đánh giá tiến độ.',
    audience: 'Học viên cần cải thiện thói quen học tập',
    level: 'ALL_LEVELS' as const,
    durationMinutes: 480,
    startDate: '2026-07-20',
    status: 'PUBLISHED' as const,
  },
  {
    code: 'CRS-010',
    name: 'Ôn tập hè chuyển cấp',
    category: 'Luyện thi',
    description: 'Tổng ôn kiến thức quan trọng trước khi bước vào cấp học mới.',
    audience: 'Học viên chuẩn bị chuyển cấp',
    level: 'ALL_LEVELS' as const,
    durationMinutes: 1020,
    startDate: '2026-08-01',
    status: 'ARCHIVED' as const,
  },
];

async function main() {
  const client = postgres(databaseUrl!);
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding fake courses...');

    const courseCodes = fakeCourses.map((course) => course.code);
    const existingCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(inArray(courses.code, courseCodes));
    const existingCourseIds = existingCourses.map((course) => course.id);

    if (existingCourseIds.length > 0) {
      await db
        .delete(courseAssignments)
        .where(inArray(courseAssignments.courseId, existingCourseIds));
      await db
        .delete(courseLessons)
        .where(inArray(courseLessons.courseId, existingCourseIds));
      await db
        .delete(courseObjectives)
        .where(inArray(courseObjectives.courseId, existingCourseIds));
    }

    let seededCourseCount = 0;

    for (const fakeCourse of fakeCourses) {
      const [course] = await db
        .insert(courses)
        .values(fakeCourse)
        .onConflictDoUpdate({
          target: courses.code,
          set: {
            name: fakeCourse.name,
            category: fakeCourse.category,
            description: fakeCourse.description,
            audience: fakeCourse.audience,
            level: fakeCourse.level,
            durationMinutes: fakeCourse.durationMinutes,
            startDate: fakeCourse.startDate,
            status: fakeCourse.status,
            updatedAt: new Date(),
          },
        })
        .returning();

      seededCourseCount += 1;

      await db.insert(courseObjectives).values([
        {
          courseId: course.id,
          content: 'Nắm được kiến thức nền và luồng học chính.',
          position: 1,
        },
        {
          courseId: course.id,
          content: 'Hoàn thành bài tập thực hành sau mỗi chuyên đề.',
          position: 2,
        },
        {
          courseId: course.id,
          content: 'Theo dõi tiến độ và cải thiện kết quả qua từng tuần.',
          position: 3,
        },
      ]);

      const lessonRows = await db
        .insert(courseLessons)
        .values([
          {
            courseId: course.id,
            code: `${course.code}-L01`,
            title: 'Khởi động và đánh giá đầu vào',
            durationMinutes: 45,
            type: 'VIDEO',
            status: 'PUBLISHED',
            resourceCount: 2,
            position: 1,
          },
          {
            courseId: course.id,
            code: `${course.code}-L02`,
            title: 'Chuyên đề trọng tâm',
            durationMinutes: 60,
            type: 'READING',
            status: 'PUBLISHED',
            resourceCount: 3,
            position: 2,
          },
          {
            courseId: course.id,
            code: `${course.code}-L03`,
            title: 'Thực hành có hướng dẫn',
            durationMinutes: 75,
            type: 'EXERCISE',
            status: course.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
            resourceCount: 1,
            position: 3,
          },
        ])
        .returning();

      await db.insert(courseAssignments).values([
        {
          courseId: course.id,
          lessonId: lessonRows[1]?.id,
          code: `${course.code}-ASM01`,
          title: 'Quiz kiểm tra nhanh',
          type: 'QUIZ',
          dueAt: new Date('2026-08-15T17:00:00.000Z'),
          submissionCount: 24,
          gradedCount: 18,
          averageScore: '8.10',
          status: 'GRADING',
        },
        {
          courseId: course.id,
          lessonId: lessonRows[2]?.id,
          code: `${course.code}-ASM02`,
          title: 'Bài tập thực hành cuối chuyên đề',
          type: 'EXERCISE',
          dueAt: new Date('2026-08-22T17:00:00.000Z'),
          submissionCount: 12,
          gradedCount: 0,
          averageScore: '0',
          status: course.status === 'DRAFT' ? 'DRAFT' : 'OPEN',
        },
      ]);
    }

    console.log(`Seeded ${seededCourseCount} courses.`);
  } catch (error) {
    console.error('Failed to seed fake courses');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
