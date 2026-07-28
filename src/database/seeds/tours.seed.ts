import { DataSource } from 'typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { TourImage } from '../../tours/entities/tour-image.entity';
import { Category } from '../../categories/entities/category.entity';

export async function seedTours(dataSource: DataSource, categories: Category[]): Promise<Tour[]> {
  const tourRepository = dataSource.getRepository(Tour);
  const imageRepository = dataSource.getRepository(TourImage);

  const tours: Partial<Tour>[] = [];

  for (let i = 1; i <= 60; i++) {
    const category = categories.length > 0 ? categories[(i - 1) % categories.length] : null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i * 2));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    tours.push({
      title: `lorem ${i}`,
      description: `lorem ipsum dolor sit amet consectetur adipiscing elit.`,
      price: 1500000 + i * 250000,
      location: 'lorem ipsum.',
      startDate,
      endDate,
      maxParticipants: 10,
      categoryId: category ? category.id : undefined,
    });
  }

  await tourRepository
    .createQueryBuilder()
    .insert()
    .into(Tour)
    .values(tours)
    .orIgnore()
    .execute();

  const savedTours = await tourRepository.find();

  const tourImages: Partial<TourImage>[] = [];
  for (const tour of savedTours) {
    tourImages.push(
      { tourId: tour.id, file: `tour.jpg` },
      { tourId: tour.id, file: `tour.jpg` },
    );
  }

  await imageRepository
    .createQueryBuilder()
    .insert()
    .into(TourImage)
    .values(tourImages)
    .orIgnore()
    .execute();

  return savedTours;
}
