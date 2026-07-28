import dataSource from '../data-source';
import { seedUsers } from './users.seed';

async function runSeed() {
  console.log('Start seeding...');

  try {
    await dataSource.initialize();

    await seedUsers(dataSource);

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
