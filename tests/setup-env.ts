import "dotenv/config";

// Make sure application code (src/lib/prisma.ts) talks to the test database.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
