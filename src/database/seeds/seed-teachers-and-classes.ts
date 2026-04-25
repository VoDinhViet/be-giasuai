import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { users } from '../schemas/users';
import { classes } from '../schemas/classes';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

function generateCode(prefix: 'CLS' | 'INV'): string {
  return `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  const client = postgres(databaseUrl!, {
    ssl: 'verify-full',
  });
  const db = drizzle(client);

  try {
    console.log('--- Seeding Teachers and Classes ---');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = [
      {
        email: 'teacher1@giasu.ai',
        username: 'teacher1',
        fullName: 'Nguyễn Văn A',
        role: 'TEACHER',
      },
      {
        email: 'teacher2@giasu.ai',
        username: 'teacher2',
        fullName: 'Trần Thị B',
        role: 'TEACHER',
      },
      {
        email: 'teacher3@giasu.ai',
        username: 'teacher3',
        fullName: 'Lê Văn C',
        role: 'TEACHER',
      },
      {
        email: 'teacher4@giasu.ai',
        username: 'teacher4',
        fullName: 'Phạm Thị D',
        role: 'TEACHER',
      },
      {
        email: 'teacher5@giasu.ai',
        username: 'teacher5',
        fullName: 'Hoàng Văn E',
        role: 'TEACHER',
      },
      {
        email: 'student_owner1@giasu.ai',
        username: 'student_owner1',
        fullName: 'Học Sinh A (Chủ lớp)',
        role: 'USER',
      },
      {
        email: 'student_owner2@giasu.ai',
        username: 'student_owner2',
        fullName: 'Học Sinh B (Chủ lớp)',
        role: 'USER',
      },
    ];

    for (const data of userData) {
      console.log(`Creating user (${data.role}): ${data.fullName}...`);

      const [userRecord] = await db
        .insert(users)
        .values({
          email: data.email,
          username: data.username,
          password: hashedPassword,
          fullName: data.fullName,
          role: data.role as any,
        })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });

      const userId = userRecord?.id;

      if (userId) {
        const numClasses = Math.floor(Math.random() * 3) + 3; // 3-5 classes
        console.log(`Creating ${numClasses} classes for ${data.fullName}...`);

        for (let i = 1; i <= numClasses; i++) {
          await db.insert(classes).values({
            name: `Lớp ${data.fullName} - Khóa ${i}`,
            description: `Đây là lớp học mẫu số ${i} của người dùng ${data.fullName}.`,
            teacherId: userId,
            code: generateCode('CLS'),
            inviteCode: generateCode('INV'),
            isActive: true,
          });
        }
      } else {
        console.log(
          `User ${data.email} already exists, skipping class creation for them.`,
        );
      }
    }

    console.log('--- Seed completed successfully ---');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed teachers and classes');
  console.error(error);
  process.exit(1);
});
