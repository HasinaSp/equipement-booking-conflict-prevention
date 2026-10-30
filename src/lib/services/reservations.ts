import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CreateReservationInput } from "@/lib/validation/reservation";

// PostgreSQL error code raised when the "Reservation_no_overlap" exclusion constraint is violated.
const EXCLUSION_VIOLATION = "23P01";

export function listReservations(db: PrismaClient, equipmentId?: string) {
return db.reservation.findMany({
where: equipmentId ? { equipmentId } : undefined,
include: { equipment: { select: { id: true, name: true } } },
orderBy: { startsAt: "asc" },
});
}

interface TimeRange {
startsAt: Date;
endsAt: Date;
}

/**
 * Returns the first reservation of the equipment that overlaps the given range, if any.
 * Ranges are half-open [startsAt, endsAt): two ranges overlap when each starts before the other ends.
 */
export function findOverlappingReservation(db: PrismaClient, equipmentId: string, range: TimeRange) {
return db.reservation.findFirst({
where: {
equipmentId,
startsAt: { lt: range.endsAt },
endsAt: { gt: range.startsAt },
},
orderBy: { startsAt: "asc" },
});
}

export async function createReservation(db: PrismaClient, input: CreateReservationInput) {
const equipment = await db.equipment.findUnique({ where: { id: input.equipmentId } });
if (!equipment) {
throw new NotFoundError(`Equipment ${input.equipmentId} not found`);
}

const overlapping = await findOverlappingReservation(db, input.equipmentId, input);
if (overlapping) {
throw new ConflictError(`${equipment.name} is already reserved during this time`, {
conflictingReservation: overlapping,
});
}

try {
return await db.reservation.create({ data: input });
} catch (error) {
// Two concurrent requests can both pass the check above; the database constraint has the final say.
if (isExclusionViolation(error)) {
throw new ConflictError(`${equipment.name} is already reserved during this time`);
}
throw error;
}
}

function isExclusionViolation(error: unknown): boolean {
if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
return false;
}
const meta = error.meta as { driverAdapterError?: { cause?: { originalCode?: string } } } | undefined;
return meta?.driverAdapterError?.cause?.originalCode === EXCLUSION_VIOLATION;
}
