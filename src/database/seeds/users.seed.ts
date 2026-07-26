import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role, User } from '../../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);

  // Pre-hash passwords to optimize execution speed (< 50ms)
  const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
  const userPasswordHash = bcrypt.hashSync('User123!', 10);

  const users: Partial<User>[] = [
    {
      email: 'admin@example.com',
      password: adminPasswordHash,
      name: 'System Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: Role.ADMIN,
    },
    {
      email: 'user1@example.com',
      password: userPasswordHash,
      name: 'Nguyễn Văn A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
      role: Role.USER,
    },
    {
      email: 'user2@example.com',
      password: userPasswordHash,
      name: 'Trần Thị B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
      role: Role.USER,
    },
  ];

  const firstNames = ['Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Nghô'];
  const middleNames = ['Văn', 'Thị', 'Đình', 'Minh', 'Hồng', 'Thành', 'Quang', 'Bảo'];
  const lastNames = ['Hùng', 'Dũng', 'Trang', 'Hoa', 'Tú', 'Nam', 'Kiên', 'Hải', 'Yến', 'Long'];

  for (let i = 3; i <= 55; i++) {
    const fn = firstNames[i % firstNames.length];
    const mn = middleNames[i % middleNames.length];
    const ln = lastNames[i % lastNames.length];
    const name = `${fn} ${mn} ${ln}`;
    const email = `user${i}@example.com`;

    users.push({
      email,
      password: userPasswordHash,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`,
      role: Role.USER,
    });
  }

  console.log(`[USERS SEED] Generating ${users.length} user records...`);
  await userRepository
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(users)
    .orIgnore()
    .execute();

  console.log(`[USERS SEED] Successfully seeded ${users.length} users.`);
  return userRepository.find();
}
