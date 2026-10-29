import { NextResponse } from "next/server";
import { errorResponse, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createEquipment, listEquipment } from "@/lib/services/equipment";
import { createEquipmentSchema } from "@/lib/validation/equipment";

export async function GET() {
  try {
    return NextResponse.json(await listEquipment(prisma));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createEquipmentSchema.parse(await readJson(request));
    return NextResponse.json(await createEquipment(prisma, input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
