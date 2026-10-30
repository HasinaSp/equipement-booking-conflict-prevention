-- btree_gist lets a GiST index combine equality on "equipmentId" with range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Two reservations of the same equipment may not overlap.
-- Ranges are half-open [startsAt, endsAt), so back-to-back bookings are allowed.
ALTER TABLE "Reservation"
ADD CONSTRAINT "Reservation_no_overlap"
EXCLUDE USING gist (
"equipmentId" WITH =,
tstzrange("startsAt", "endsAt", '[)') WITH &&
);