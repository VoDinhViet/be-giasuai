import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';

import { users } from '../schemas/users';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

async function main() {
  const client = postgres(databaseUrl!, {
    ssl: 'verify-full',
  });
  const db = drizzle(client);

  try {
    const adminEmail = 'admin@giasu.ai';
    const adminUsername = 'admin';
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [insertedAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'ADMIN',
      })
      .onConflictDoNothing({ target: users.email })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      });

    if (insertedAdmin) {
      console.log('Admin account created successfully:');
      console.log(`- ID: ${insertedAdmin.id}`);
      console.log(`- Email: ${insertedAdmin.email}`);
      console.log(`- Username: ${insertedAdmin.username}`);
      console.log(
        `- Password: ${adminPassword} (Please change this immediately)`,
      );
    } else {
      console.log('Admin account already exists or could not be created.');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed admin user');
  console.error(error);
  process.exit(1);
});
