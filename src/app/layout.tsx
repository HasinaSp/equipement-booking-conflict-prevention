import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equipment Reservation",
  description: "Book shared team equipment without overlapping reservations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
