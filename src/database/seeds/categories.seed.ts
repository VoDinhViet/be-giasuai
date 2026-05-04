import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schemas';
import { categories, CategoryType } from '../schemas';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

async function main() {
  const client = postgres(databaseUrl!, {
    ssl: 'allow', // Adjust as per your environment
  });
  const db = drizzle(client, { schema });

  try {
    console.log('🌱 Seeding categories...');

    // 1. Levels
    const levels = [
      { code: 'PRIMARY', name: 'Tiểu học', sortOrder: 1 },
      { code: 'SECONDARY', name: 'THCS', sortOrder: 2 },
      { code: 'HIGH', name: 'THPT', sortOrder: 3 },
      { code: 'UNIVERSITY', name: 'Đại học', sortOrder: 4 },
    ];

    const levelNodes: Record<string, any> = {};

    for (const level of levels) {
      const [node] = await db
        .insert(categories)
        .values({
          type: CategoryType.LEVEL,
          code: level.code,
          name: level.name,
          sortOrder: level.sortOrder,
        })
        .onConflictDoUpdate({
          target: categories.code,
          set: { name: level.name, sortOrder: level.sortOrder },
        })
        .returning();
      levelNodes[level.code] = node;
      console.log(`✅ Level created: ${node.name}`);
    }

    // 2. Grades & Subjects for School Levels
    const schoolHierarchy = [
      {
        levelCode: 'PRIMARY',
        grades: [
          { code: 'G1', name: 'Lớp 1', sortOrder: 1 },
          { code: 'G2', name: 'Lớp 2', sortOrder: 2 },
          { code: 'G3', name: 'Lớp 3', sortOrder: 3 },
          { code: 'G4', name: 'Lớp 4', sortOrder: 4 },
          { code: 'G5', name: 'Lớp 5', sortOrder: 5 },
        ],
        subjects: [
          { code: 'MATH_P', name: 'Toán học', sortOrder: 1 },
          { code: 'VIET_P', name: 'Tiếng Việt', sortOrder: 2 },
          { code: 'ENG_P', name: 'Tiếng Anh', sortOrder: 3 },
        ],
      },
      {
        levelCode: 'SECONDARY',
        grades: [
          { code: 'G6', name: 'Lớp 6', sortOrder: 6 },
          { code: 'G7', name: 'Lớp 7', sortOrder: 7 },
          { code: 'G8', name: 'Lớp 8', sortOrder: 8 },
          { code: 'G9', name: 'Lớp 9', sortOrder: 9 },
        ],
        subjects: [
          { code: 'MATH_S', name: 'Toán học', sortOrder: 1 },
          { code: 'PHYS_S', name: 'Vật lý', sortOrder: 2 },
          { code: 'CHEM_S', name: 'Hóa học', sortOrder: 3 },
          { code: 'LIT_S', name: 'Ngữ văn', sortOrder: 4 },
        ],
      },
      {
        levelCode: 'HIGH',
        grades: [
          { code: 'G10', name: 'Lớp 10', sortOrder: 10 },
          { code: 'G11', name: 'Lớp 11', sortOrder: 11 },
          { code: 'G12', name: 'Lớp 12', sortOrder: 12 },
        ],
        subjects: [
          { code: 'MATH_H', name: 'Toán học', sortOrder: 1 },
          { code: 'PHYS_H', name: 'Vật lý', sortOrder: 2 },
          { code: 'CHEM_H', name: 'Hóa học', sortOrder: 3 },
          { code: 'LIT_H', name: 'Ngữ văn', sortOrder: 4 },
          { code: 'BIO_H', name: 'Sinh học', sortOrder: 5 },
        ],
      },
    ];

    for (const h of schoolHierarchy) {
      const parentLevel = levelNodes[h.levelCode];
      for (const grade of h.grades) {
        const [gradeNode] = await db
          .insert(categories)
          .values({
            parentId: parentLevel.id,
            type: CategoryType.GRADE,
            code: grade.code,
            name: grade.name,
            sortOrder: grade.sortOrder,
          })
          .onConflictDoUpdate({
            target: categories.code,
            set: { parentId: parentLevel.id, name: grade.name, sortOrder: grade.sortOrder },
          })
          .returning();
        
        console.log(`  📂 Grade created: ${gradeNode.name}`);

        for (const sub of h.subjects) {
          await db
            .insert(categories)
            .values({
              parentId: gradeNode.id,
              type: CategoryType.SUBJECT,
              code: `${grade.code}_${sub.code}`,
              name: sub.name,
              sortOrder: sub.sortOrder,
            })
            .onConflictDoUpdate({
              target: categories.code,
              set: { parentId: gradeNode.id, name: sub.name, sortOrder: sub.sortOrder },
            });
        }
      }
    }

    // 3. University Majors & Subjects
    const uniParent = levelNodes['UNIVERSITY'];
    const majors = [
      {
        code: 'IT',
        name: 'Công nghệ thông tin',
        sortOrder: 1,
        subjects: [
          { code: 'PROG', name: 'Lập trình cơ bản', sortOrder: 1 },
          { code: 'DB', name: 'Cơ sở dữ liệu', sortOrder: 2 },
          { code: 'WEB', name: 'Lập trình Web', sortOrder: 3 },
        ],
      },
      {
        code: 'ECON',
        name: 'Kinh tế',
        sortOrder: 2,
        subjects: [
          { code: 'MICRO', name: 'Kinh tế vi mô', sortOrder: 1 },
          { code: 'MACRO', name: 'Kinh tế vĩ mô', sortOrder: 2 },
          { code: 'ACC', name: 'Kế toán tài chính', sortOrder: 3 },
        ],
      },
    ];

    for (const major of majors) {
      const [majorNode] = await db
        .insert(categories)
        .values({
          parentId: uniParent.id,
          type: CategoryType.MAJOR,
          code: major.code,
          name: major.name,
          sortOrder: major.sortOrder,
        })
        .onConflictDoUpdate({
          target: categories.code,
          set: { parentId: uniParent.id, name: major.name, sortOrder: major.sortOrder },
        })
        .returning();

      console.log(`  📂 Major created: ${majorNode.name}`);

      for (const sub of major.subjects) {
        await db
          .insert(categories)
          .values({
            parentId: majorNode.id,
            type: CategoryType.SUBJECT,
            code: `${major.code}_${sub.code}`,
            name: sub.name,
            sortOrder: sub.sortOrder,
          })
          .onConflictDoUpdate({
            target: categories.code,
            set: { parentId: majorNode.id, name: sub.name, sortOrder: sub.sortOrder },
          });
      }
    }

    console.log('🚀 Categories seeding completed successfully!');
  } catch (error) {
    console.error('❌ Failed to seed categories');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
