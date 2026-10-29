import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./booking-form";
import styles from "./page.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function Home() {
  // Render on each request so the list always reflects the database.
  await connection();

  const equipment = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    include: {
      reservations: {
        where: { endsAt: { gt: new Date() } },
        orderBy: { startsAt: "asc" },
      },
    },
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Equipment Reservation</h1>
        <p>Shared team equipment and its upcoming reservations (times in UTC).</p>
      </header>

      {equipment.length === 0 ? (
        <p className={styles.muted}>No equipment yet. Run `npm run db:seed` to add sample data.</p>
      ) : (
        <BookingForm equipment={equipment.map(({ id, name }) => ({ id, name }))} />
      )}

      {equipment.length > 0 && (
        <section className={styles.grid}>
          {equipment.map((item) => (
            <article key={item.id} className={styles.card}>
              <h2>{item.name}</h2>
              {item.description && <p className={styles.muted}>{item.description}</p>}
              {item.reservations.length === 0 ? (
                <ul>
                  <li className={styles.muted}>Available, no upcoming reservations</li>
                </ul>
              ) : (
                <ul>
                  {item.reservations.map((reservation) => (
                    <li key={reservation.id}>
                      {dateFormat.format(reservation.startsAt)} → {dateFormat.format(reservation.endsAt)}
                      {" · "}
                      {reservation.reservedBy}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
