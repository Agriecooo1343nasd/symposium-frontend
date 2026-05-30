import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors & Exhibitors — NAS 2026",
  description: "Meet the sponsors and exhibitors of the 3rd National Agroecology Symposium.",
};

export default function ExhibitorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
