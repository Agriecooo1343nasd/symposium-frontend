import { useEffect, useState } from "react";
import { MessageCircle, ThumbsUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, getLiveZoomMeeting, getLiveRunOfShowItem } from "@/lib/store";
import { ZoomMeetingEmbed } from "@/components/zoom/ZoomMeetingEmbed";
import { toast } from "sonner";

type Props = {
  authorName: string;
  authorEmail?: string;
  location?: "virtual" | "in-person";
  title?: string;
  subtitle?: string;
};

/** Shared live session UI: simulated Zoom video + live comment feed */
export function LiveStreamRoom({ authorName, authorEmail, location = "virtual", title, subtitle }: Props) {
  const store = useStore();
  const [question, setQuestion] = useState("");
  const [tick, setTick] = useState(0);
  const liveZoom = getLiveZoomMeeting();
  const liveSegment = getLiveRunOfShowItem();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const approved = store.remoteInteractions.filter((i) => i.status === "approved" || i.status === "answered");
  const pending = store.remoteInteractions.filter((i) => i.status === "pending");
  const feed = [...approved, ...pending.slice(0, 4)].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const submitInteraction = (type: "question" | "comment" | "reaction", message: string) => {
    if (!message.trim()) return;
    patchStore((s) => ({
      ...s,
      remoteInteractions: [
        {
          id: uid("ri"),
          type,
          author: authorName,
          authorEmail,
          message,
          timestamp: new Date().toISOString(),
          status: "pending",
          runOfShowItemId: liveSegment?.id,
          location,
        },
        ...s.remoteInteractions,
      ],
    }));
    setQuestion("");
    toast.success(type === "reaction" ? "Reaction sent!" : "Submitted to moderator queue");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{title ?? "Live session"}</h1>
        <p className="text-muted-foreground">
          {subtitle ?? "Watch the symposium stream and join the conversation in real time."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6">
        <div className="space-y-4">
          {liveSegment && (
            <div className="rounded-md bg-card border border-border px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground font-semibold">Now streaming</div>
                <div className="font-medium">{liveSegment.title}</div>
              </div>
              {liveSegment.status === "live" && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 animate-pulse">
                  Live
                </span>
              )}
            </div>
          )}

          {liveZoom ? (
            <ZoomMeetingEmbed meeting={liveZoom} title={liveSegment?.title} simulateVideo />
          ) : (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
              The moderator has not started a Zoom meeting yet. Check back when the session goes live.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-card border border-border p-4">
            <h2 className="font-serif font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Participate
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question or comment…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitInteraction("question", question)}
              />
              <Button className="gradient-blue text-accent-foreground shrink-0" onClick={() => submitInteraction("question", question)}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["👏", "❤️", "🎉", "💡"].map((emoji) => (
                <Button key={emoji} variant="outline" size="sm" onClick={() => submitInteraction("reaction", emoji)}>
                  {emoji}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => submitInteraction("comment", "Great session!")}>
                <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Quick comment
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-card border border-border p-4">
            <h2 className="font-serif font-bold mb-2 text-sm flex items-center justify-between">
              <span>Live feed</span>
              <span className="text-[10px] font-normal text-muted-foreground uppercase">{feed.length} messages</span>
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto" key={tick}>
              {feed.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments yet — be the first to participate.</p>
              ) : (
                feed.map((i) => (
                  <div
                    key={i.id}
                    className={`text-sm rounded-md px-2 py-1.5 ${
                      i.status === "pending" ? "bg-secondary/50 border border-dashed border-border" : "border-l-2 border-accent pl-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{i.author}</span>
                      {i.status === "pending" && (
                        <span className="text-[9px] uppercase text-muted-foreground">queued</span>
                      )}
                      {i.status === "approved" && (
                        <span className="text-[9px] uppercase text-green font-semibold">on screen</span>
                      )}
                    </div>
                    <span className="text-muted-foreground">{i.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
