import type { PrismaClient } from "@/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";
import type { CreateReservationInput } from "@/lib/validation/reservation";

export function listReservations(db: PrismaClient, equipmentId?: string) {
  return db.reservation.findMany({
    where: equipmentId ? { equipmentId } : undefined,
    include: { equipment: { select: { id: true, name: true } } },
    orderBy: { startsAt: "asc" },
  });
}

export async function createReservation(db: PrismaClient, input: CreateReservationInput) {
  const equipment = await db.equipment.findUnique({ where: { id: input.equipmentId } });
  if (!equipment) {
    throw new NotFoundError(`Equipment ${input.equipmentId} not found`);
  }

  // Overlap prevention is introduced in the next milestone.
  return db.reservation.create({ data: input });
}
