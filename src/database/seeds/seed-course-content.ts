import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../schemas';
import {
  courseLessons,
  courseResources,
  courseSections,
  courses,
  users,
} from '../schemas';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const teacherSeed = {
  email: 'teacher.course@giasu.ai',
  username: 'teacher_course_demo',
  fullName: 'Course Demo Teacher',
  password: '123456',
};

const courseSeed = {
  title: 'Lập trình Scratch cho trẻ em từ cơ bản đến sáng tạo game',
  slug: 'lap-trinh-scratch-cho-tre-em-tu-co-ban-den-sang-tao-game',
  description:
    'Khóa học giúp học sinh làm quen tư duy lập trình, sự kiện, biến, điều kiện và lặp qua các dự án game và animation đơn giản.',
  shortDescription: 'Lộ trình Scratch trọn bộ cho học sinh mới bắt đầu.',
  thumbnailUrl:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  introVideoUrl: 'https://www.youtube.com/watch?v=jXUZaf5D12Y',
  level: 'BEGINNER' as const,
  price: 499000,
  estimatedDurationMinutes: 360,
  tags: ['scratch', 'lap-trinh', 'tre-em', 'game'],
  learningOutcomes: [
    'Hiểu được các khối lệnh cơ bản trong Scratch',
    'Tự tạo animation và mini game đơn giản',
    'Biết tách bài toán thành các bước xử lý nhỏ',
    'Rèn luyện tư duy logic và giải quyết vấn đề',
  ],
  isPublished: true,
};

const sectionsSeed = [
  {
    title: 'Làm quen với Scratch và tư duy lập trình',
    description: 'Giới thiệu giao diện, khối lệnh và cách tạo dự án đầu tiên.',
    position: 1,
    lessons: [
      {
        title: 'Scratch là gì và em sẽ học được gì',
        summary: 'Tổng quan về Scratch và cách học hiệu quả trong khóa học.',
        content:
          'Bài học giới thiệu về Scratch, đối tượng phù hợp và cách tiếp cận lập trình qua hình ảnh, âm thanh và chuyển động.',
        videoUrl: 'https://www.youtube.com/watch?v=VIpmkeqJhm4',
        lessonType: 'VIDEO' as const,
        durationMinutes: 15,
        position: 1,
        isPreview: true,
        isPublished: true,
        resources: [
          {
            title: 'Tài liệu tổng quan khóa học',
            resourceType: 'DOCUMENT' as const,
            resourceUrl: 'https://scratch.mit.edu/ideas',
          },
        ],
      },
      {
        title: 'Khám phá giao diện Scratch',
        summary: 'Làm quen sân khấu, sprite, block và khu vực code.',
        content:
          'Học sinh tìm hiểu từng thành phần trong Scratch editor và cách tạo, đổi tên, sắp xếp sprite.',
        videoUrl: 'https://www.youtube.com/watch?v=7Bq8G4JxL5k',
        lessonType: 'VIDEO' as const,
        durationMinutes: 25,
        position: 2,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Link vào Scratch Editor',
            resourceType: 'LINK' as const,
            resourceUrl: 'https://scratch.mit.edu/projects/editor/',
          },
        ],
      },
      {
        title: 'Dự án đầu tiên: Nhân vật chào mừng',
        summary: 'Tạo animation ngắn với sự kiện và hiệu ứng.',
        content:
          'Xây dựng dự án nhân vật chào mừng sử dụng sự kiện when green flag clicked và các khối looks, motion.',
        videoUrl: 'https://www.youtube.com/watch?v=1jHvXakt1qw',
        lessonType: 'ASSIGNMENT' as const,
        durationMinutes: 30,
        position: 3,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'File mẫu tham khảo',
            resourceType: 'FILE' as const,
            resourceUrl: 'https://scratch.mit.edu/projects/editor/',
          },
        ],
      },
    ],
  },
  {
    title: 'Lập trình game với sự kiện và điều kiện',
    description: 'Xây dựng mini game có tương tác, tính điểm và thua thắng.',
    position: 2,
    lessons: [
      {
        title: 'Điều khiển nhân vật bằng bàn phím',
        summary: 'Dùng sự kiện bàn phím để di chuyển nhân vật.',
        content:
          'Học sinh thực hành game điều khiển nhân vật bằng phím mũi tên và hiểu cách xử lý input.',
        videoUrl: 'https://www.youtube.com/watch?v=ln6Vn_WKkWU',
        lessonType: 'VIDEO' as const,
        durationMinutes: 35,
        position: 1,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Mẫu project điều khiển nhân vật',
            resourceType: 'LINK' as const,
            resourceUrl: 'https://scratch.mit.edu/explore/projects/games/',
          },
        ],
      },
      {
        title: 'Thêm vật cản và xử lý va chạm',
        summary: 'Sử dụng if, touching và âm thanh khi va chạm.',
        content:
          'Bài học giúp học sinh hiểu điều kiện if, lệnh cảm biến touching và cách tạo phản hồi khi va chạm.',
        videoUrl: 'https://www.youtube.com/watch?v=uS8qj5lP0bQ',
        lessonType: 'VIDEO' as const,
        durationMinutes: 40,
        position: 2,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Hướng dẫn block Sensing',
            resourceType: 'DOCUMENT' as const,
            resourceUrl: 'https://scratch.mit.edu/help/',
          },
        ],
      },
      {
        title: 'Dự án mini game: Bắt sao tính điểm',
        summary: 'Tổng hợp kiến thức để tạo mini game đầu tiên.',
        content:
          'Xây dựng trò chơi bắt sao, tính điểm, đặt giới hạn thời gian và thông báo kết quả.',
        videoUrl: 'https://www.youtube.com/watch?v=9RdYdC4a8mM',
        lessonType: 'ASSIGNMENT' as const,
        durationMinutes: 50,
        position: 3,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Bộ sprite miễn phí',
            resourceType: 'IMAGE' as const,
            resourceUrl: 'https://scratch.mit.edu/images/scratch-og.png',
          },
        ],
      },
    ],
  },
  {
    title: 'Hoàn thiện dự án và thuyết trình sản phẩm',
    description: 'Tối ưu game, thêm âm thanh và chia sẻ dự án.',
    position: 3,
    lessons: [
      {
        title: 'Tối ưu trải nghiệm người chơi',
        summary: 'Cân chỉnh tốc độ, âm thanh và độ khó của game.',
        content:
          'Học sinh học cách điều chỉnh tốc độ, thêm âm thanh hợp lý và bố cục giao diện để game dễ chơi hơn.',
        videoUrl: 'https://www.youtube.com/watch?v=OQ8P0tN6s7g',
        lessonType: 'READING' as const,
        durationMinutes: 20,
        position: 1,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Tài nguyên âm thanh tham khảo',
            resourceType: 'AUDIO' as const,
            resourceUrl: 'https://scratch.mit.edu/',
          },
        ],
      },
      {
        title: 'Chia sẻ dự án lên Scratch',
        summary: 'Cách lưu, chia sẻ và viết mô tả dự án.',
        content:
          'Bài học hướng dẫn cách đặt tên dự án, viết mô tả, gắn tag và chia sẻ dự án lên cộng đồng Scratch.',
        videoUrl: 'https://www.youtube.com/watch?v=K8mB8b9XQ7M',
        lessonType: 'VIDEO' as const,
        durationMinutes: 20,
        position: 2,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Cộng đồng Scratch',
            resourceType: 'LINK' as const,
            resourceUrl: 'https://scratch.mit.edu/explore/projects/all',
          },
        ],
      },
      {
        title: 'Bài tập cuối khóa: Tự thiết kế game của riêng em',
        summary: 'Học sinh tự chọn chủ đề và trình bày sản phẩm.',
        content:
          'Đây là bài tập tổng kết. Học sinh tự thiết kế game riêng, trình bày ý tưởng, luật chơi và hướng mở rộng sản phẩm.',
        videoUrl: 'https://www.youtube.com/watch?v=1jHvXakt1qw',
        lessonType: 'ASSIGNMENT' as const,
        durationMinutes: 60,
        position: 3,
        isPreview: false,
        isPublished: true,
        resources: [
          {
            title: 'Checklist nộp bài cuối khóa',
            resourceType: 'DOCUMENT' as const,
            resourceUrl: 'https://scratch.mit.edu/help/',
          },
        ],
      },
    ],
  },
];

async function main() {
  const client = postgres(databaseUrl!, {
    ssl: 'verify-full',
  });
  const db = drizzle(client, { schema });

  try {
    const hashedPassword = await bcrypt.hash(teacherSeed.password, 10);

    let [teacher] = await db
      .insert(users)
      .values({
        email: teacherSeed.email,
        username: teacherSeed.username,
        fullName: teacherSeed.fullName,
        password: hashedPassword,
        role: 'TEACHER',
      })
      .onConflictDoNothing({ target: users.email })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });

    if (!teacher) {
      const existingTeacher = await db.query.users.findFirst({
        where: eq(users.email, teacherSeed.email),
        columns: {
          id: true,
          email: true,
          username: true,
        },
      });

      if (!existingTeacher) {
        throw new Error('Failed to resolve seed teacher');
      }

      teacher = existingTeacher;
    }

    let course = await db.query.courses.findFirst({
      where: eq(courses.slug, courseSeed.slug),
      columns: {
        id: true,
      },
    });

    if (!course) {
      const [createdCourse] = await db
        .insert(courses)
        .values({
          ...courseSeed,
          teacherId: teacher.id,
        })
        .returning({
          id: courses.id,
        });

      course = createdCourse;
    } else {
      await db
        .update(courses)
        .set({
          ...courseSeed,
          teacherId: teacher.id,
        })
        .where(eq(courses.id, course.id));

      await db
        .delete(courseSections)
        .where(eq(courseSections.courseId, course.id));
    }

    for (const sectionSeed of sectionsSeed) {
      const [section] = await db
        .insert(courseSections)
        .values({
          courseId: course.id,
          title: sectionSeed.title,
          description: sectionSeed.description,
          position: sectionSeed.position,
        })
        .returning({
          id: courseSections.id,
          title: courseSections.title,
        });

      for (const lessonSeed of sectionSeed.lessons) {
        const [lesson] = await db
          .insert(courseLessons)
          .values({
            sectionId: section.id,
            title: lessonSeed.title,
            summary: lessonSeed.summary,
            content: lessonSeed.content,
            videoUrl: lessonSeed.videoUrl,
            lessonType: lessonSeed.lessonType,
            durationMinutes: lessonSeed.durationMinutes,
            position: lessonSeed.position,
            isPreview: lessonSeed.isPreview,
            isPublished: lessonSeed.isPublished,
          })
          .returning({
            id: courseLessons.id,
            title: courseLessons.title,
          });

        if (lessonSeed.resources.length > 0) {
          await db.insert(courseResources).values(
            lessonSeed.resources.map((resource) => ({
              lessonId: lesson.id,
              title: resource.title,
              resourceType: resource.resourceType,
              resourceUrl: resource.resourceUrl,
            })),
          );
        }

        console.log(`Inserted lesson: ${lesson.title}`);
      }

      console.log(`Inserted section: ${section.title}`);
    }

    console.log('Seeded complete course content successfully');
    console.log(`Teacher email: ${teacher.email}`);
    console.log(`Teacher username: ${teacher.username}`);
    console.log(`Teacher password: ${teacherSeed.password}`);
    console.log(`Course slug: ${courseSeed.slug}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed course content');
  console.error(error);
  process.exit(1);
});
