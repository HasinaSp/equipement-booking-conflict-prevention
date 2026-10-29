import { z } from "zod";

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
