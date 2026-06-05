"use client";

import { useMemo, useState } from "react";
import { Plus, Play, Square, Eye, EyeOff, Trash2, Pencil, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { SESSIONS } from "@/lib/mock-data";
import {
  audienceSummary,
  createLivePoll,
  deleteLivePoll,
  setPollStatus,
  tallyPoll,
  TICKET_CATEGORY_OPTIONS,
  togglePollResultsVisible,
  updateLivePoll,
  VOTER_ROLES,
  PARTICIPATION_OPTIONS,
  type CreatePollInput,
} from "@/lib/live-polls";
import type { LivePoll, PollAudienceConfig } from "@/lib/store";
import { PollResultsChart } from "./PollResultsChart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Role } from "@/lib/mock-data";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";

const emptyAudience = (): PollAudienceConfig => ({
  roles: ["attendee", "speaker", "exhibitor"],
  ticketCategoryIds: [],
  participationKinds: [],
});

export function PollManagePanel() {
  const store = useStore();
  const { session } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LivePoll | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [optionLines, setOptionLines] = useState("Option A\nOption B\nOption C");
  const [audience, setAudience] = useState<PollAudienceConfig>(emptyAudience);

  const sorted = useMemo(
    () => [...store.livePolls].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [store.livePolls],
  );

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setQuestion("");
    setDescription("");
    setSessionId("");
    setOptionLines("Option A\nOption B\nOption C");
    setAudience(emptyAudience());
    setDialogOpen(true);
  };

  useAdminCommandAction({
    "new-poll": openCreate,
  });

  const openEdit = (poll: LivePoll) => {
    if (poll.status !== "draft") {
      toast.error("Only draft polls can be edited");
      return;
    }
    setEditing(poll);
    setTitle(poll.title);
    setQuestion(poll.question);
    setDescription(poll.description ?? "");
    setSessionId(poll.sessionId ?? "");
    setOptionLines(poll.options.map((o) => o.label).join("\n"));
    setAudience({ ...poll.audience });
    setDialogOpen(true);
  };

  const toggleRole = (role: Role) => {
    setAudience((a) => {
      const has = a.roles.includes(role);
      return {
        ...a,
        roles: has ? a.roles.filter((r) => r !== role) : [...a.roles, role],
      };
    });
  };

  const toggleTicket = (id: string) => {
    setAudience((a) => {
      const has = a.ticketCategoryIds.includes(id);
      return {
        ...a,
        ticketCategoryIds: has ? a.ticketCategoryIds.filter((x) => x !== id) : [...a.ticketCategoryIds, id],
      };
    });
  };

  const save = () => {
    const options = optionLines.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!title.trim() || !question.trim() || options.length < 2) {
      toast.error("Title, question, and at least 2 options are required");
      return;
    }
    if (audience.roles.length === 0) {
      toast.error("Select at least one role that can vote");
      return;
    }

    if (editing) {
      updateLivePoll(editing.id, {
        title: title.trim(),
        question: question.trim(),
        description: description.trim() || undefined,
        sessionId: sessionId || undefined,
        options: options.map((label, i) => ({
          id: editing.options[i]?.id ?? `po-${i}`,
          label,
        })),
        audience,
      });
      toast.success("Poll updated");
    } else {
      const input: CreatePollInput = {
        title,
        question,
        description,
        options,
        sessionId: sessionId || undefined,
        audience,
        createdBy: session?.name ?? "Staff",
      };
      createLivePoll(input);
      toast.success("Poll created as draft");
    }
    setDialogOpen(false);
  };

  const preview = previewId ? store.livePolls.find((p) => p.id === previewId) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
            <Radio className="h-8 w-8 text-accent" />
            Live polls
          </h1>
          <p className="text-muted-foreground mt-1">
            Create voting sessions, choose who can participate, launch during plenary, and publish results (FR-6.2).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> New poll
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Poll</th>
              <th className="text-left px-4 py-3">Audience</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Votes</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((poll) => {
              const total = tallyPoll(poll, store.pollVotes).reduce((a, t) => a + t.count, 0);
              return (
                <tr key={poll.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{poll.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{poll.question}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">{audienceSummary(poll)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase",
                        poll.status === "open" && "border-green text-green",
                      )}
                    >
                      {poll.status}
                    </Badge>
                    {poll.resultsVisible && (
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        Results public
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{total}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setPreviewId(poll.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {poll.status === "draft" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openEdit(poll)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setPollStatus(poll.id, "open");
                            toast.success("Poll is live — eligible users can vote");
                          }}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            deleteLivePoll(poll.id);
                            toast.info("Draft deleted");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {poll.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPollStatus(poll.id, "closed");
                          toast.success("Poll closed");
                        }}
                      >
                        <Square className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      title={poll.resultsVisible ? "Hide results from voters" : "Show results to voters"}
                      onClick={() => {
                        togglePollResultsVisible(poll.id, !poll.resultsVisible);
                        toast.success(poll.resultsVisible ? "Results hidden" : "Results visible to voters");
                      }}
                    >
                      {poll.resultsVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="p-8 text-center text-muted-foreground text-sm">No polls yet. Create your first voting session.</p>
        )}
      </div>

      {preview && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
          <h2 className="font-serif font-bold mb-4">Results preview — {preview.title}</h2>
          <PollResultsChart
            tally={tallyPoll(preview, store.pollVotes)}
            totalVotes={tallyPoll(preview, store.pollVotes).reduce((a, t) => a + t.count, 0)}
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit draft poll" : "New voting session"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Session title (internal)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Closing plenary pulse" />
            </div>
            <div>
              <Label>Question shown to voters</Label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Which theme should…?" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Link to programme session (optional)</Label>
              <Select value={sessionId || "_none"} onValueChange={(v) => setSessionId(v === "_none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="z-[250]">
                  <SelectItem value="_none">No session link</SelectItem>
                  {SESSIONS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      Day {s.day} — {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Answer options (one per line)</Label>
              <Textarea value={optionLines} onChange={(e) => setOptionLines(e.target.value)} rows={5} className="font-mono text-sm" />
            </div>
            <div className="rounded-xl border border-border p-4 space-y-3">
              <Label className="text-base">Who can vote?</Label>
              <p className="text-xs text-muted-foreground">Only users signed in with a matching role (and filters below) will see this poll.</p>
              <div className="grid grid-cols-2 gap-2">
                {VOTER_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={audience.roles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                    <span className="capitalize">{role.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold mb-2">Limit by ticket type (optional)</p>
                <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
                  {TICKET_CATEGORY_OPTIONS.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox checked={audience.ticketCategoryIds.includes(t.id)} onCheckedChange={() => toggleTicket(t.id)} />
                      {t.label}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Leave all unchecked to allow any ticket type.</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold mb-2">Exhibitor participation (optional)</p>
                {PARTICIPATION_OPTIONS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer mb-1">
                    <Checkbox
                      checked={audience.participationKinds.includes(p.id)}
                      onCheckedChange={() =>
                        setAudience((a) => ({
                          ...a,
                          participationKinds: a.participationKinds.includes(p.id)
                            ? a.participationKinds.filter((x) => x !== p.id)
                            : [...a.participationKinds, p.id],
                        }))
                      }
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
