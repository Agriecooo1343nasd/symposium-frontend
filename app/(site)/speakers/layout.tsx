import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speakers — NAS 2026",
  description: "Meet the speakers of the 3rd National Agroecology Symposium.",
};

export default function SpeakersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
