import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/equipment/route";
import { resetDatabase, testDb } from "../helpers/db";

function postEquipment(body: unknown) {
  return POST(
    new Request("http://localhost/api/equipment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/equipment", () => {
  beforeEach(resetDatabase);
  afterAll(() => testDb.$disconnect());

  it("creates equipment and lists it", async () => {
    const created = await postEquipment({ name: "Projector", description: "1080p" });
    expect(created.status).toBe(201);

    const response = await GET();
    expect(response.status).toBe(200);
    const items = await response.json();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: "Projector", description: "1080p" });
  });

  it("returns 400 for an invalid payload", async () => {
    const response = await postEquipment({ name: "" });
    expect(response.status).toBe(400);
    expect((await response.json()).details.name).toBeDefined();
  });

  it("returns 409 when the name is already taken", async () => {
    await postEquipment({ name: "Projector" });
    const response = await postEquipment({ name: "Projector" });
    expect(response.status).toBe(409);
  });
});
