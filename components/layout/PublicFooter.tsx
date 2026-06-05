"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Mail, MapPin, Globe } from "lucide-react";
import { EVENT } from "@/lib/mock-data";

export function PublicFooter() {
  const pathname = usePathname();
  const hiddenPrefixes = ["/login", "/dashboard", "/admin", "/desk", "/moderator", "/speaker", "/exhibitor"];
  const isHiddenPage = hiddenPrefixes.some((p) => pathname === p || pathname?.startsWith(p + "/"));
  if (isHiddenPage) return null;
  return (
    <footer className="gradient-navy grain-overlay text-primary-foreground border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-lg">NAS 2026</div>
                <div className="text-xs opacity-70">Agroecology Symposium</div>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Cultivating Rwanda's agroecological future — together.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Globe, Globe, Globe, Globe].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-4 opacity-90">Event</h4>
            <ul className="space-y-2.5 text-sm opacity-80">
              <li><Link href="/about" className="hover:opacity-100 hover:text-gold transition-colors">About</Link></li>
              <li><Link href="/programme" className="hover:opacity-100 hover:text-gold transition-colors">Programme</Link></li>
              <li><Link href="/speakers" className="hover:opacity-100 hover:text-gold transition-colors">Speakers</Link></li>
              <li><Link href="/exhibitors" className="hover:opacity-100 hover:text-gold transition-colors">Sponsors & Exhibitors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-4 opacity-90">Resources</h4>
            <ul className="space-y-2.5 text-sm opacity-80">
              <li><Link href="/news" className="hover:opacity-100 hover:text-gold transition-colors">News & Blog</Link></li>
              <li><Link href="/faq" className="hover:opacity-100 hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link href="/register" className="hover:opacity-100 hover:text-gold transition-colors">Registration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-4 opacity-90">Contact</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{EVENT.venue}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@nas2026.rw" className="hover:text-gold transition-colors">hello@nas2026.rw</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60">
          <p>© 2026 {EVENT.organizer}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:opacity-100 hover:text-gold transition-colors">Terms</a>
            <a href="#" className="hover:opacity-100 hover:text-gold transition-colors">Code of Conduct</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
