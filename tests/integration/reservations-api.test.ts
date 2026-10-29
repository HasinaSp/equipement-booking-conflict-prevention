import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/reservations/route";
import { resetDatabase, testDb } from "../helpers/db";

function postReservation(body: unknown) {
  return POST(
    new Request("http://localhost/api/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/reservations", () => {
  let equipmentId: string;

  beforeEach(async () => {
    await resetDatabase();
    equipmentId = (await testDb.equipment.create({ data: { name: "Camera" } })).id;
  });
  afterAll(() => testDb.$disconnect());

  it("creates a reservation and lists it for the equipment", async () => {
    const response = await postReservation({
      equipmentId,
      reservedBy: "Alice",
      startsAt: "2026-11-02T09:00:00Z",
      endsAt: "2026-11-02T11:00:00Z",
    });
    expect(response.status).toBe(201);

    const list = await GET(new Request(`http://localhost/api/reservations?equipmentId=${equipmentId}`));
    const reservations = await list.json();
    expect(reservations).toHaveLength(1);
    expect(reservations[0]).toMatchObject({
      reservedBy: "Alice",
      startsAt: "2026-11-02T09:00:00.000Z",
      endsAt: "2026-11-02T11:00:00.000Z",
      equipment: { id: equipmentId, name: "Camera" },
    });
  });

  it("returns 400 when the end is before the start", async () => {
    const response = await postReservation({
      equipmentId,
      reservedBy: "Alice",
      startsAt: "2026-11-02T11:00:00Z",
      endsAt: "2026-11-02T09:00:00Z",
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for a non-JSON body", async () => {
    const response = await POST(
      new Request("http://localhost/api/reservations", { method: "POST", body: "not json" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 for unknown equipment", async () => {
    const response = await postReservation({
      equipmentId: "missing",
      reservedBy: "Alice",
      startsAt: "2026-11-02T09:00:00Z",
      endsAt: "2026-11-02T11:00:00Z",
    });
    expect(response.status).toBe(404);
  });

  it("enforces a valid time range at the database level", async () => {
    await expect(
      testDb.reservation.create({
        data: {
          equipmentId,
          reservedBy: "Alice",
          startsAt: new Date("2026-11-02T11:00:00Z"),
          endsAt: new Date("2026-11-02T09:00:00Z"),
        },
      }),
    ).rejects.toThrow();
  });
});
