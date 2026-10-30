import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/reservations/route";
import { resetDatabase, testDb } from "../helpers/db";

function postReservation(equipmentId: string, start: string, end: string, reservedBy = "Alice") {
return POST(
new Request("http://localhost/api/reservations", {
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({
equipmentId,
reservedBy,
startsAt: `2026-11-02T${start}:00Z`,
endsAt: `2026-11-02T${end}:00Z`,
}),
}),
);
}

describe("reservation conflicts", () => {
let cameraId: string;
let projectorId: string;

beforeEach(async () => {
await resetDatabase();
cameraId = (await testDb.equipment.create({ data: { name: "Camera" } })).id;
projectorId = (await testDb.equipment.create({ data: { name: "Projector" } })).id;
expect((await postReservation(cameraId, "10:00", "12:00")).status).toBe(201);
});
afterAll(() => testDb.$disconnect());

it("rejects an overlapping reservation with 409 and the conflicting booking", async () => {
const response = await postReservation(cameraId, "11:00", "13:00", "Bob");
expect(response.status).toBe(409);

const body = await response.json();
expect(body.error).toBe("Camera is already reserved during this time");
expect(body.details.conflictingReservation).toMatchObject({
reservedBy: "Alice",
startsAt: "2026-11-02T10:00:00.000Z",
endsAt: "2026-11-02T12:00:00.000Z",
});
});

it("rejects a reservation contained in an existing one", async () => {
expect((await postReservation(cameraId, "10:30", "11:30")).status).toBe(409);
});

it("allows back-to-back reservations", async () => {
expect((await postReservation(cameraId, "12:00", "14:00")).status).toBe(201);
expect((await postReservation(cameraId, "08:00", "10:00")).status).toBe(201);
});

it("allows the same time range on different equipment", async () => {
expect((await postReservation(projectorId, "10:00", "12:00")).status).toBe(201);
});

it("accepts only one of two concurrent overlapping requests", async () => {
const responses = await Promise.all([
postReservation(projectorId, "14:00", "16:00", "Alice"),
postReservation(projectorId, "15:00", "17:00", "Bob"),
]);

expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
expect(await testDb.reservation.count({ where: { equipmentId: projectorId } })).toBe(1);
});

it("enforces non-overlap at the database level", async () => {
await expect(
testDb.reservation.create({
data: {
equipmentId: cameraId,
reservedBy: "Bob",
startsAt: new Date("2026-11-02T11:00:00Z"),
endsAt: new Date("2026-11-02T13:00:00Z"),
},
}),
).rejects.toThrow(/Reservation_no_overlap/);
});
});