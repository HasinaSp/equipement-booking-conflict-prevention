import { describe, expect, it } from "vitest";
import { createEquipmentSchema } from "@/lib/validation/equipment";

describe("createEquipmentSchema", () => {
  it("accepts a name with an optional description", () => {
    expect(createEquipmentSchema.parse({ name: " Projector " })).toEqual({ name: "Projector" });
    expect(createEquipmentSchema.parse({ name: "Camera", description: "Full-frame" })).toEqual({
      name: "Camera",
      description: "Full-frame",
    });
  });

  it("rejects an empty name", () => {
    expect(createEquipmentSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});
