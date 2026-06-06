import * as dotenv from 'dotenv';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { UserRole } from '../../constants/role.constant';
import { hashPassword } from '../../utils/password.util';
import * as schema from '../schemas';
import {
  userProfiles,
  users,
  type NewUser,
  type NewUserProfile,
} from '../schemas';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const defaultPassword = '12345678';

const seedUsers = [
  {
    email: 'admin@giasuai.com',
    username: 'admin',
    fullName: 'Quản trị hệ thống',
    role: UserRole.ADMIN,
    isLocked: false,
    profile: {
      phone: '0901000001',
      location: 'Hà Nội',
      bio: 'Quản trị viên phụ trách vận hành hệ thống Gia Sư AI.',
      avatarUrl: 'https://i.pravatar.cc/300?u=admin@giasuai.com',
    },
  },
  {
    email: 'instructor@giasuai.com',
    username: 'instructor',
    fullName: 'Nguyễn Minh Anh',
    role: UserRole.INSTRUCTOR,
    isLocked: false,
    profile: {
      phone: '0902000001',
      location: 'TP. Hồ Chí Minh',
      bio: 'Giáo viên Toán có 8 năm kinh nghiệm luyện thi THPT Quốc gia.',
      avatarUrl: 'https://i.pravatar.cc/300?u=instructor@giasuai.com',
    },
  },
  {
    email: 'learner01@giasuai.com',
    username: 'learner01',
    fullName: 'Trần Gia Bảo',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000001',
      location: 'Đà Nẵng',
      bio: 'Học sinh lớp 12 cần củng cố Toán và Vật lý.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner01@giasuai.com',
    },
  },
  {
    email: 'learner02@giasuai.com',
    username: 'learner02',
    fullName: 'Lê Phương Thảo',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000002',
      location: 'Hải Phòng',
      bio: 'Học viên luyện IELTS, mục tiêu 7.0 trong 6 tháng.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner02@giasuai.com',
    },
  },
  {
    email: 'learner03@giasuai.com',
    username: 'learner03',
    fullName: 'Phạm Đức Huy',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000003',
      location: 'Cần Thơ',
      bio: 'Sinh viên năm nhất muốn học thêm lập trình TypeScript.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner03@giasuai.com',
    },
  },
  {
    email: 'learner04@giasuai.com',
    username: 'learner04',
    fullName: 'Võ Khánh Linh',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000004',
      location: 'Bình Dương',
      bio: 'Học sinh lớp 10 muốn xây nền tảng Hóa học.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner04@giasuai.com',
    },
  },
  {
    email: 'learner05@giasuai.com',
    username: 'learner05',
    fullName: 'Đỗ Nhật Nam',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000005',
      location: 'Đồng Nai',
      bio: 'Cần học kèm tiếng Anh giao tiếp buổi tối.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner05@giasuai.com',
    },
  },
  {
    email: 'learner06@giasuai.com',
    username: 'learner06',
    fullName: 'Hoàng Mai Chi',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000006',
      location: 'Huế',
      bio: 'Học viên cần ôn Ngữ văn và kỹ năng viết luận.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner06@giasuai.com',
    },
  },
  {
    email: 'learner07@giasuai.com',
    username: 'learner07',
    fullName: 'Bùi Quốc Việt',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000007',
      location: 'Nha Trang',
      bio: 'Muốn học thêm Tin học và tư duy thuật toán.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner07@giasuai.com',
    },
  },
  {
    email: 'learner08@giasuai.com',
    username: 'learner08',
    fullName: 'Ngô Thanh Tâm',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000008',
      location: 'Quảng Ninh',
      bio: 'Học sinh lớp 9 ôn thi vào lớp 10 môn Toán.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner08@giasuai.com',
    },
  },
  {
    email: 'learner09@giasuai.com',
    username: 'learner09',
    fullName: 'Đặng Minh Khang',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000009',
      location: 'Long An',
      bio: 'Cần gia sư kèm Vật lý cơ bản và bài tập cuối tuần.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner09@giasuai.com',
    },
  },
  {
    email: 'learner10@giasuai.com',
    username: 'learner10',
    fullName: 'Nguyễn Hoài An',
    role: UserRole.LEARNER,
    isLocked: false,
    profile: {
      phone: '0913000010',
      location: 'Hà Nội',
      bio: 'Học viên muốn học tiếng Anh nền tảng từ đầu.',
      avatarUrl: 'https://i.pravatar.cc/300?u=learner10@giasuai.com',
    },
  },
] satisfies Array<
  Omit<NewUser, 'password'> & {
    profile: Omit<NewUserProfile, 'userId'>;
  }
>;

async function main() {
  const client = postgres(databaseUrl!);
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding demo users...');

    const password = await hashPassword(defaultPassword);
    const seedEmails = seedUsers.map((user) => user.email);

    await db.transaction(async (tx) => {
      await tx.delete(users).where(inArray(users.email, seedEmails));

      for (const seedUser of seedUsers) {
        const { profile, ...userValues } = seedUser;
        const [user] = await tx
          .insert(users)
          .values({
            ...userValues,
            password,
          })
          .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            role: users.role,
          });

        await tx.insert(userProfiles).values({
          userId: user.id,
          ...profile,
        });
      }
    });

    console.log('Seeded 12 demo users successfully.');
    console.log(`Password for all demo users: ${defaultPassword}`);
    console.table(
      seedUsers.map(({ email, username, role }) => ({ email, username, role })),
    );
  } catch (error) {
    console.error('Failed to seed demo users');
    console.error(error);
  } finally {
    await client.end();
  }
}

void main();
