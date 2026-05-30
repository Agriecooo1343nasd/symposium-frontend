import type { Metadata } from "next";
import { getSessionById } from "@/lib/sessions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const session = getSessionById(id);
  if (!session) return {};
  return {
    title: `${session.title} — NAS 2026`,
    description: session.description,
  };
}

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
