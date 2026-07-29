import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export async function seedCategories(dataSource: DataSource): Promise<Category[]> {
  const categoryRepository = dataSource.getRepository(Category);

  const categories: Partial<Category>[] = [];

  for (let i = 1; i <= 10; i++) {
    categories.push({
      name: `lorem ${i}`,
      description: 'lorem ipsum dolor sit amet consectetur adipiscing elit.',
    });
  }

  await categoryRepository
    .createQueryBuilder()
    .insert()
    .into(Category)
    .values(categories)
    .orIgnore()
    .execute();

  return categoryRepository.find();
}
