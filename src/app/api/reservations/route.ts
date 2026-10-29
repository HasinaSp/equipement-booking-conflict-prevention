import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createReservation, listReservations } from "@/lib/services/reservations";
import { createReservationSchema } from "@/lib/validation/reservation";

export async function GET(request: Request) {
  try {
    const equipmentId = new URL(request.url).searchParams.get("equipmentId") ?? undefined;
    return NextResponse.json(await listReservations(prisma, equipmentId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createReservationSchema.parse(await readJson(request));
    return NextResponse.json(await createReservation(prisma, input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
