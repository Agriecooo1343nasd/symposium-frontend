import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programme — NAS 2026",
  description: "Interactive two-day agenda for the 3rd National Agroecology Symposium.",
};

export default function ProgrammeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
