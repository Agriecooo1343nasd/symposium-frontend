import { Mic, Video, Users, MessageSquare, Share2, MoreHorizontal, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ZoomMeeting } from "@/lib/zoom-mock";
import { cn } from "@/lib/utils";

type Props = {
  meeting?: ZoomMeeting | null;
  title?: string;
  compact?: boolean;
  className?: string;
  /** Animated faux video tiles for prototype live stream */
  simulateVideo?: boolean;
};

const SPEAKER_TILES = [
  { name: "Dr. Mukeshimana", hue: "from-emerald-900/80 to-teal-950" },
  { name: "Panel — Jean-B.", hue: "from-slate-800/90 to-slate-950" },
  { name: "Moderator", hue: "from-indigo-900/80 to-blue-950" },
];

/** Visual mock of embedded Zoom — production would load Zoom Web SDK iframe here */
export function ZoomMeetingEmbed({ meeting, title, compact, className, simulateVideo }: Props) {
  const active = meeting?.status === "live" || simulateVideo;

  return (
    <div className={cn("border border-border bg-[#1a1a1a] overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded bg-[#2D8CFF] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            Z
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">{title ?? meeting?.title ?? "NAS 2026 — Live plenary"}</div>
            <div className="text-[10px] text-zinc-400">{active ? "Connected · Zoom Meetings" : "Waiting for host…"}</div>
          </div>
        </div>
        {active && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-600 text-white shrink-0">Live</span>
        )}
      </div>

      <div className={cn("relative bg-gradient-to-br from-[#1e3a2f] via-[#0f172a] to-[#1a1a2e]", compact ? "aspect-video" : "aspect-video min-h-[280px]")}>
        {simulateVideo && active ? (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 bg-black">
            {SPEAKER_TILES.map((tile, i) => (
              <div
                key={tile.name}
                className={cn(
                  "relative overflow-hidden bg-gradient-to-br flex items-end p-2",
                  tile.hue,
                  i === 0 && "col-span-2 row-span-1",
                )}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
                    animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
                  }}
                />
                <div className="relative z-10 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] text-white font-bold">
                    {tile.name.slice(0, 2)}
                  </div>
                  <span className="text-[10px] text-white/90 font-medium truncate">{tile.name}</span>
                  {i === 0 && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] text-white/70">
                      <Mic className="h-3 w-3" /> speaking
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="absolute bottom-3 right-3 w-24 h-16 rounded border-2 border-[#2D8CFF] bg-[#1a365d] flex items-end p-1 shadow-lg">
              <span className="text-[9px] text-white/90">You</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-[#2D8CFF]/20 border-2 border-[#2D8CFF] flex items-center justify-center mb-3">
                <Users className="h-10 w-10 text-[#2D8CFF]" />
              </div>
              <p className="text-white/90 text-sm font-medium">
                {active ? "Symposium live stream" : "Meeting room preview"}
              </p>
              <p className="text-zinc-400 text-xs mt-1 max-w-xs mx-auto">
                {active
                  ? "Embedded Zoom Web SDK — video tiles render here in production"
                  : "Host will start the meeting when the segment begins"}
              </p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <div className="rounded bg-black/60 px-2 py-1 text-[10px] text-white flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            REC
          </div>
          <div className="rounded bg-black/60 px-2 py-1 text-[10px] text-white">248 viewing</div>
        </div>

        {!simulateVideo && (
          <div className="absolute bottom-3 right-3 w-28 h-20 rounded border-2 border-white/30 bg-[#2d3748] flex items-end p-1">
            <span className="text-[9px] text-white/80">You</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 px-3 py-3 bg-[#2d2d2d] border-t border-[#3d3d3d]">
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <Mic className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <Video className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <Users className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white ml-2">
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>

      {meeting && !compact && (
        <div className="px-3 py-2 bg-[#232323] text-[10px] font-mono text-zinc-400 border-t border-[#3d3d3d]">
          ID {meeting.meetingId} · Passcode {meeting.passcode}
        </div>
      )}
    </div>
  );
}
