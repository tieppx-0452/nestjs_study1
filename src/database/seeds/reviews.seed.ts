import { DataSource } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';

export async function seedReviews(
  dataSource: DataSource,
  users: User[],
  tours: Tour[],
): Promise<Review[]> {
  const reviewRepository = dataSource.getRepository(Review);

  const reviews: Partial<Review>[] = [];
  const userIds = users.map((user) => user.id);
  const tourIds = tours.map((tour) => tour.id);

  for (let i = 0; i < 60; i++) {
    reviews.push({
      userId: userIds[i],
      tourId: tourIds[i],
      comment: 'lorem ipsum dolor sit amet consectetur adipiscing elit.',
    });
  }

  await reviewRepository
    .createQueryBuilder()
    .insert()
    .into(Review)
    .values(reviews)
    .orIgnore()
    .execute();

  return reviewRepository.find();
}
