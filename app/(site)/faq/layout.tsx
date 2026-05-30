import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — NAS 2026",
  description: "Frequently asked questions about registration, payment, venue, and more.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
