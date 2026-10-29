import "dotenv/config";
import { createPrismaClient } from "@/lib/prisma";

export const testDb = createPrismaClient(process.env.TEST_DATABASE_URL);

export async function resetDatabase() {
  await testDb.$executeRawUnsafe('TRUNCATE TABLE "Reservation", "Equipment" CASCADE');
}
