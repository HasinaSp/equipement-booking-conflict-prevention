import { z } from "zod";

export const createReservationSchema = z
  .object({
    equipmentId: z.string().min(1, "Equipment is required"),
    reservedBy: z.string().trim().min(1, "Reserved by is required").max(100),
    startsAt: z.coerce.date({ error: "Start must be a valid date" }),
    endsAt: z.coerce.date({ error: "End must be a valid date" }),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "End must be after start",
    path: ["endsAt"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
