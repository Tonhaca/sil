// Setup file for tests
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup global test environment
  console.log('🧪 Test environment setup complete');
});

afterAll(() => {
  // Cleanup after tests
  console.log('🧹 Test environment cleanup complete');
});
