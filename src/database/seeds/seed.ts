import dataSource from '../data-source';
import { seedUsers } from './users.seed';

async function runSeed() {
  const startTime = Date.now();
  console.log('[SEED START] Initializing database connection...');

  try {
    await dataSource.initialize();
    console.log('[SEED DB] Connected to PostgreSQL Database.');

    // Seed Users (Admin + 54 Users)
    await seedUsers(dataSource);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[SEED COMPLETE] Successfully completed seeding in ${duration}s.`);
  } catch (error) {
    console.error('[SEED ERROR] Failed to seed database:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('[SEED DB] Connection closed.');
    }
  }
}

runSeed();
