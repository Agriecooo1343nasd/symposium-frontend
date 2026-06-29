"use client";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SessionCard } from "@/components/SessionCard";
import { SUB_THEMES, type Session } from "@/lib/mock-data";
import { usePublicSessions } from "@/hooks/api/usePublicData";
import { useAddToSchedule, useMySchedule } from "@/hooks/api/useDashboard";
import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPES: Session["type"][] = ["Keynote", "Plenary", "Panel", "Workshop", "Field Visit"];

export default function Programme() {
  const { sessions: allSessions, raw, isLoading } = usePublicSessions();
  const { isAuthenticated } = useAuth();
  const { sessionIds } = useMySchedule();
  const addToSchedule = useAddToSchedule();
  const [theme, setTheme] = useState<string>("All");
  const [type, setType] = useState<string>("All");

  const speakerLookup = useMemo(() => {
    const map = new Map<string, { id: string; name: string; photo: string }>();
    raw.forEach((s) => (s.speakers ?? []).forEach((sp) => map.set(sp.id, { id: sp.id, name: sp.name, photo: sp.photoUrl ?? "" })));
    return map;
  }, [raw]);

  const resolveSpeakers = (s: Session) =>
    s.speakers.map((id) => speakerLookup.get(id)).filter(Boolean) as { id: string; name: string; photo: string }[];

  const handleSave = async (sessionId: string, title: string) => {
    if (!isAuthenticated) {
      toast.error("Sign in to save sessions to your agenda");
      return;
    }
    if (sessionIds.has(sessionId)) {
      toast.info("Already in your schedule", { description: title });
      return;
    }
    try {
      await addToSchedule.mutateAsync(sessionId);
      toast.success("Added to your schedule", { description: title });
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const filtered = useMemo(
    () =>
      allSessions.filter(
        (s) => (theme === "All" || s.subTheme === theme) && (type === "All" || s.type === type),
      ),
    [theme, type, allSessions],
  );

  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-16 sm:py-20">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-2xl">
              Two days. <span className="text-gradient-light">Dozens of conversations.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl bg-secondary/40 border border-border">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" /> Filter
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...SUB_THEMES] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  theme === t ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:ml-auto">
            {(["All", ...TYPES] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  type === t ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="1">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
            <TabsTrigger value="1">Day 1 · Aug 13</TabsTrigger>
            <TabsTrigger value="2">Day 2 · Aug 14</TabsTrigger>
          </TabsList>

          {([1, 2] as const).map((d) => (
            <TabsContent key={d} value={String(d)}>
              <div className="grid md:grid-cols-2 gap-5">
                {filtered
                  .filter((s) => s.day === d)
                  .map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      speakers={resolveSpeakers(s)}
                      saved={sessionIds.has(s.id)}
                      unsaveLabel="Saved"
                      onSave={() => handleSave(s.id, s.title)}
                    />
                  ))}
                {filtered.filter((s) => s.day === d).length === 0 && (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    {isLoading ? "Loading sessions…" : "No sessions scheduled yet for this day."}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </>
  );
}
