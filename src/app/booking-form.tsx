"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./booking-form.module.css";

type EquipmentOption = { id: string; name: string };

type Status = { kind: "success" | "error"; message: string } | null;

// datetime-local inputs have no time zone; the app shows times in UTC, so read them as UTC too.
function toUtcIso(value: string) {
  return value ? `${value}:00Z` : "";
}

export function BookingForm({ equipment }: { equipment: EquipmentOption[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        equipmentId: form.get("equipmentId"),
        reservedBy: form.get("reservedBy"),
        startsAt: toUtcIso(String(form.get("startsAt"))),
        endsAt: toUtcIso(String(form.get("endsAt"))),
      }),
    });
    const body = await response.json();
    setSubmitting(false);

    if (response.ok) {
      setStatus({ kind: "success", message: "Reservation created." });
      router.refresh();
    } else {
      setStatus({ kind: "error", message: body.error ?? "The reservation could not be created." });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Book equipment</h2>
      <div className={styles.fields}>
        <label>
          Equipment
          <select name="equipmentId" required>
            {equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reserved by
          <input name="reservedBy" required placeholder="Your name" />
        </label>
        <label>
          Starts at (UTC)
          <input name="startsAt" type="datetime-local" required />
        </label>
        <label>
          Ends at (UTC)
          <input name="endsAt" type="datetime-local" required />
        </label>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Booking…" : "Book"}
      </button>
      {status && (
        <p role="status" className={status.kind === "error" ? styles.error : styles.success}>
          {status.message}
        </p>
      )}
    </form>
  );
}
