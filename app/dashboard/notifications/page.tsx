"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Calendar, Users, Megaphone, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS, type Notification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON: Record<Notification["type"], typeof Bell> = {
  session: Calendar,
  connection: Users,
  system: Bell,
  announcement: Megaphone,
};

export default function DashboardNotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = filter === "unread" ? items.filter((n) => n.unread) : items;

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{items.filter((n) => n.unread).length} unread</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "gradient-blue text-accent-foreground" : ""}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={filter === "unread" ? "gradient-blue text-accent-foreground" : ""}
          >
            Unread
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {list.map((n) => {
          const Icon = ICON[n.type];
          return (
            <Link
              key={n.id}
              href={n.href ?? "/dashboard"}
              onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
              className={cn(
                "block rounded-2xl border p-4 hover-lift",
                n.unread ? "bg-accent/5 border-accent/40" : "bg-card border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-serif font-bold text-sm">{n.title}</div>
                    {n.unread && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                </div>
              </div>
            </Link>
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-16 text-muted-foreground rounded-2xl bg-card border border-dashed border-border">
            All caught up
          </div>
        )}
      </div>
    </div>
  );
}
