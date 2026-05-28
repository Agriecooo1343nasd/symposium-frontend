import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — NAS 2026",
  description: "Register for the 3rd National Agroecology Symposium · Kigali, 13–14 August 2026.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
