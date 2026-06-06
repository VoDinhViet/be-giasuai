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
    console.log('🌱 Seeding admin account...');

    const email = 'admin@giasuai.com';
    const username = 'admin';
    const fullName = 'System Administrator';
    const password = '123456';

    const hashedPassword = await hashPassword(password);

    const [adminUser] = await db
      .insert(users)
      .values({
        email,
        username,
        fullName,
        password: hashedPassword,
        role: 'ADMIN',
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          password: hashedPassword,
          fullName,
          updatedAt: new Date(),
        },
      })
      .returning();

    await db
      .insert(userProfiles)
      .values({ userId: adminUser.id })
      .onConflictDoNothing({ target: userProfiles.userId });

    console.log(`✅ Admin account created/updated successfully!`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Username: ${adminUser.username}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error('❌ Failed to seed admin account');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
