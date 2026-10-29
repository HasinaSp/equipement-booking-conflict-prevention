import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const equipment = [
  { name: "Sony A7 IV camera", description: "Full-frame mirrorless camera with 28-70mm lens" },
  { name: "Epson projector", description: "1080p projector for meeting room presentations" },
  { name: "MacBook Pro 14\"", description: "Spare laptop for demos and onboarding" },
];

async function main() {
  for (const item of equipment) {
    await prisma.equipment.upsert({
      where: { name: item.name },
      update: { description: item.description },
      create: item,
    });
  }
  console.log(`Seeded ${equipment.length} equipment items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
