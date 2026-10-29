import { describe, expect, it } from "vitest";
import { createReservationSchema } from "@/lib/validation/reservation";

const valid = {
  equipmentId: "eq_1",
  reservedBy: "Alice",
  startsAt: "2026-11-02T09:00:00Z",
  endsAt: "2026-11-02T11:00:00Z",
};

describe("createReservationSchema", () => {
  it("accepts a valid reservation and coerces dates", () => {
    const result = createReservationSchema.parse(valid);
    expect(result.startsAt).toBeInstanceOf(Date);
    expect(result.endsAt.toISOString()).toBe("2026-11-02T11:00:00.000Z");
  });

  it("trims the reservedBy field", () => {
    expect(createReservationSchema.parse({ ...valid, reservedBy: "  Bob  " }).reservedBy).toBe("Bob");
  });

  it("rejects an end before the start", () => {
    const result = createReservationSchema.safeParse({ ...valid, endsAt: "2026-11-02T08:00:00Z" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["endsAt"]);
  });

  it("rejects a zero-length reservation", () => {
    expect(createReservationSchema.safeParse({ ...valid, endsAt: valid.startsAt }).success).toBe(false);
  });

  it("rejects invalid dates", () => {
    expect(createReservationSchema.safeParse({ ...valid, startsAt: "not-a-date" }).success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(createReservationSchema.safeParse({ ...valid, reservedBy: "" }).success).toBe(false);
    expect(createReservationSchema.safeParse({ ...valid, equipmentId: undefined }).success).toBe(false);
  });
});
