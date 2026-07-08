"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Leaf, LayoutDashboard, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/api/useAuthSession";
import { dashboardPathForRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/layout/UserAvatar";

const NAV = [
  { to: "/about", label: "About" },
  { to: "/programme", label: "Programme" },
  { to: "/speakers", label: "Speakers" },
  { to: "/exhibitors", label: "Exhibitors" },
  { to: "/news", label: "News" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { session, user } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hiddenPrefixes = ["/login", "/dashboard", "/admin", "/desk", "/moderator", "/speaker", "/exhibitor"];
  const isHiddenPage = hiddenPrefixes.some((p) => pathname === p || pathname?.startsWith(p + "/"));
  if (isHiddenPage) return null;

  const profileImage = user?.profileImageUrl ?? session?.avatar;
  const dashboardPath = session ? dashboardPathForRole(session.role) : "/dashboard";

  const handleSignOut = async () => {
    await logout.mutateAsync();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-navy text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base font-bold tracking-tight text-foreground">NAS 2026</span>
            <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Agroecology · Kigali</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                pathname === item.to
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border border-border bg-card hover:bg-secondary/60 transition-colors">
                  <UserAvatar
                    name={session.name}
                    imageUrl={profileImage}
                    className="h-7 w-7"
                    fallbackClassName="gradient-blue text-white text-xs"
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-semibold text-foreground">{session.name.split(" ")[0]}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{session.role}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="font-semibold">{session.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{session.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardPath} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> My dashboard
                  </Link>
                </DropdownMenuItem>
                {session.role === "attendee" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <UserIcon className="h-4 w-4 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="gradient-blue text-accent-foreground hover:opacity-90">
                <Link href="/register">Register Now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 -mr-2 text-foreground"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium",
                  pathname === item.to
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
              {session ? (
                <>
                  <Button asChild>
                    <Link href={dashboardPath}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> My dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="gradient-blue text-accent-foreground">
                    <Link href="/register">Register Now</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
