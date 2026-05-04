import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import * as schema from '../schemas';
import { courses, courseSections, lessons, lessonParts, categories, CategoryType } from '../schemas';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

async function main() {
  const client = postgres(databaseUrl!, {
    ssl: 'allow',
  });
  const db = drizzle(client, { schema });

  try {
    console.log('🌱 Seeding a complete course...');

    // 1. Tìm các Category cần thiết (Level: HIGH, Grade: G10, Subject: G10_MATH_H)
    const level = await db.query.categories.findFirst({
      where: and(eq(categories.type, CategoryType.LEVEL), eq(categories.code, 'HIGH')),
    });

    const grade = await db.query.categories.findFirst({
      where: and(eq(categories.type, CategoryType.GRADE), eq(categories.code, 'G10')),
    });

    // Môn học Toán của lớp 10 (theo categories.seed.ts: code = G10_MATH_H)
    const subject = await db.query.categories.findFirst({
      where: and(eq(categories.type, CategoryType.SUBJECT), eq(categories.code, 'G10_MATH_H')),
    });

    if (!level || !grade || !subject) {
      console.warn('⚠️ Missing categories (HIGH, G10, or G10_MATH_H). Please run npm run db:seed:categories first.');
    }

    // 2. Tạo khóa học
    const [course] = await db
      .insert(courses)
      .values({
        title: 'Toán học 10: Chinh phục Đại số & Hình học',
        slug: 'toan-hoc-10-chinh-phuc-dai-so-hinh-hoc',
        description: 'Khóa học bám sát chương trình GDPT mới, giúp học sinh nắm vững kiến thức nền tảng và phương pháp giải toán nhanh.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop',
        tags: ['toan10', 'thpt', 'onthidaihoc'],
        learningOutcomes: [
          'Làm chủ các hàm số bậc hai và các phép toán tập hợp',
          'Giải quyết thành thạo các bài toán Vectơ và Hệ thức lượng',
          'Vận dụng tốt kiến thức vào các bài thi thực tế'
        ],
        levelId: level?.id,
        gradeId: grade?.id,
        subjectId: subject?.id,
        isPublished: true,
      })
      .onConflictDoUpdate({
        target: courses.slug,
        set: { updatedAt: new Date() }
      })
      .returning();

    console.log(`✅ Course created: ${course.title}`);

    // 3. Xóa dữ liệu cũ của khóa học này để seed lại sạch sẽ (nếu cần)
    // await db.delete(courseSections).where(eq(courseSections.courseId, course.id));

    // 4. Tạo các Chương (Sections)
    const sectionsData = [
      {
        title: 'Chương 1: Mệnh đề và Tập hợp',
        position: 1,
        lessons: [
          { title: 'Bài 1: Các mệnh đề toán học', duration: 30 },
          { title: 'Bài 2: Tập hợp và các phép toán trên tập hợp', duration: 45 },
        ]
      },
      {
        title: 'Chương 2: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn',
        position: 2,
        lessons: [
          { title: 'Bài 1: Bất phương trình bậc nhất hai ẩn', duration: 40 },
          { title: 'Bài 2: Hệ bất phương trình bậc nhất hai ẩn', duration: 50 },
        ]
      },
      {
        title: 'Chương 3: Hàm số bậc hai và Đồ thị',
        position: 3,
        lessons: [
          { title: 'Bài 1: Hàm số và đồ thị', duration: 35 },
          { title: 'Bài 2: Hàm số bậc hai', duration: 60 },
        ]
      }
    ];

    for (const sectionInfo of sectionsData) {
      const [section] = await db
        .insert(courseSections)
        .values({
          courseId: course.id,
          title: sectionInfo.title,
          position: sectionInfo.position,
        })
        .returning();

      console.log(`  📂 Section created: ${section.title}`);

      for (let i = 0; i < sectionInfo.lessons.length; i++) {
        const lessonInfo = sectionInfo.lessons[i];
        const [lesson] = await db
          .insert(lessons)
          .values({
            sectionId: section.id,
            title: lessonInfo.title,
            position: i + 1,
            durationMinutes: lessonInfo.duration,
            isPublished: true,
          })
          .returning();

        console.log(`    📖 Lesson created: ${lesson.title}`);

        // 5. Tạo Lesson Parts (Tài liệu đi kèm)
        await db.insert(lessonParts).values([
          {
            lessonId: lesson.id,
            title: `Bài giảng chi tiết: ${lessonInfo.title}`,
            partType: 'PDF',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            position: 1,
            isPublished: true,
          },
          {
            lessonId: lesson.id,
            title: `Bài tập tự luyện: ${lessonInfo.title}`,
            partType: 'DOCX',
            fileUrl: 'https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx',
            position: 2,
            isPublished: true,
          }
        ]);
      }
    }

    console.log('🚀 Complete course seeding successfully!');
  } catch (error) {
    console.error('❌ Failed to seed course');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
