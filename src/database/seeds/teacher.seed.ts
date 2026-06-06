import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schemas';
import { userProfiles, users } from '../schemas';
import { hashPassword } from '../../utils/password.util';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

async function main() {
  const client = postgres(databaseUrl!);
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding teacher account...');

    const email = 'teacher@giasuai.com';
    const username = 'teacher';
    const fullName = 'Demo Teacher';
    const password = '123456';

    const hashedPassword = await hashPassword(password);

    const [teacherUser] = await db
      .insert(users)
      .values({
        email,
        username,
        fullName,
        password: hashedPassword,
        role: 'TEACHER',
        isLocked: false,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          username,
          fullName,
          password: hashedPassword,
          role: 'TEACHER',
          isLocked: false,
          updatedAt: new Date(),
        },
      })
      .returning();

    await db
      .insert(userProfiles)
      .values({ userId: teacherUser.id })
      .onConflictDoNothing({ target: userProfiles.userId });

    console.log('Teacher account created/updated successfully.');
    console.log(`Email: ${teacherUser.email}`);
    console.log(`Username: ${teacherUser.username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed to seed teacher account');
    console.error(error);
  } finally {
    await client.end();
  }
}

void main();
