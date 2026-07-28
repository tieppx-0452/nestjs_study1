import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role, User } from '../../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);

  const hashedPwd = bcrypt.hashSync('Aa@123456', 10);

  const users: Partial<User>[] = [
    {
      email: 'admin@example.com',
      password: hashedPwd,
      name: 'admin',
      avatar: 'user.jpg',
      role: Role.ADMIN,
    }
  ];

  for (let i = 0; i < 50; i++) {
    const name = `name ${i}`;
    const email = `user${i}@example.com`;

    users.push({
      email,
      password: hashedPwd,
      name,
      avatar: `user.jpg`,
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
