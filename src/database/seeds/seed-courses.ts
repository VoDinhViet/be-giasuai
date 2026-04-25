import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import { courses } from '../schemas/courses';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const resolvedDatabaseUrl = databaseUrl;

const seedCourses = [
  {
    title: 'Toan tu duy lop 6',
    slug: 'toan-tu-duy-lop-6',
    description:
      'Khoa hoc giup hoc sinh cung co nen tang so hoc, tu duy logic va ky nang giai bai tap.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
  {
    title: 'Tieng Anh giao tiep co ban',
    slug: 'tieng-anh-giao-tiep-co-ban',
    description:
      'Lo trinh luyen phat am, phan xa hoi thoai va mau cau thong dung cho nguoi moi bat dau.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
  {
    title: 'Lap trinh Scratch cho tre em',
    slug: 'lap-trinh-scratch-cho-tre-em',
    description:
      'Lam quen tu duy lap trinh qua game, animation va bai toan thuc hanh bang Scratch.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
  {
    title: 'Ngu van doc hieu va viet doan',
    slug: 'ngu-van-doc-hieu-va-viet-doan',
    description:
      'Ren ky nang doc hieu, tom tat va trien khai doan van ro rang, mach lac.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
  {
    title: 'Luyen thi vao lop 10 mon Toan',
    slug: 'luyen-thi-vao-lop-10-mon-toan',
    description:
      'Tong hop dang bai trong tam, chien luoc lam bai thi va bo de luyen tap theo muc do.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
  {
    title: 'Tieng Anh thieu nhi starter',
    slug: 'tieng-anh-thieu-nhi-starter',
    description:
      'Hoc tu vung, mau cau va phan xa nghe noi qua hinh anh, bai hat va tro choi.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    isPublished: false,
  },
  {
    title: 'Hoa hoc co ban trung hoc',
    slug: 'hoa-hoc-co-ban-trung-hoc',
    description:
      'He thong kien thuc nen tang ve chat, phan ung va cach giai bai tap hoa hoc co ban.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    isPublished: false,
  },
  {
    title: 'Ky nang hoc tap hieu qua',
    slug: 'ky-nang-hoc-tap-hieu-qua',
    description:
      'Huong dan lap ke hoach, ghi chep, quan ly thoi gian va on tap khoa hoc.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
  },
];

async function main() {
  const client = postgres(resolvedDatabaseUrl, {
    ssl: 'verify-full',
  });
  const db = drizzle(client);

  try {
    const insertedCourses = await db
      .insert(courses)
      .values(seedCourses)
      .onConflictDoNothing({ target: courses.slug })
      .returning({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
      });

    console.log(`Seeded ${insertedCourses.length} courses`);

    insertedCourses.forEach((course, index) => {
      console.log(
        `${index + 1}. ${course.title} (${course.slug}) - ${course.id}`,
      );
    });
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed courses');
  console.error(error);
  process.exit(1);
});
