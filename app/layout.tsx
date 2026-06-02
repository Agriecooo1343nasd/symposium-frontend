import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAS 2026 — 3rd National Agroecology Symposium · Kigali",
  description:
    "Join 300+ delegates in Kigali on 13–14 August 2026 for the 3rd National Agroecology Symposium. Register now.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} min-h-screen flex flex-col bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
