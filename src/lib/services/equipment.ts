import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { ConflictError } from "@/lib/errors";
import type { CreateEquipmentInput } from "@/lib/validation/equipment";

export function listEquipment(db: PrismaClient) {
  return db.equipment.findMany({ orderBy: { name: "asc" } });
}

export async function createEquipment(db: PrismaClient, input: CreateEquipmentInput) {
  try {
    return await db.equipment.create({ data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError(`Equipment "${input.name}" already exists`);
    }
    throw error;
  }
}
