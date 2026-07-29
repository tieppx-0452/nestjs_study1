import dataSource from '../data-source';
import { seedUsers } from './users.seed';
import { seedCategories } from './categories.seed';
import { seedTours } from './tours.seed';
import { seedBookings } from './bookings.seed';
import { seedReviews } from './reviews.seed';

async function runSeed() {
  console.log('Start seeding...');

  try {
    await dataSource.initialize();
    await dataSource.synchronize();

    const users = await seedUsers(dataSource);
    const categories = await seedCategories(dataSource);
    const tours = await seedTours(dataSource, categories);
    await seedBookings(dataSource, users, tours);
    await seedReviews(dataSource, users, tours);

    console.log(`Seeding successfully.`);
  } catch (error) {
    console.error('Seeding failed.', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeed();
