import { useState, useMemo, useRef, useEffect } from "react";
import { Search, UserPlus, Check, X, Send, MessageCircle, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import {
  getPublicDirectory,
  getConnectionsFor,
  sendConnectionRequest,
  respondConnectionRequest,
  getThreadMessages,
  getConversationSummaries,
  sendChatMessage,
  canMessage,
  formatChatTime,
  formatChatDayLabel,
  SUB_THEMES,
} from "@/lib/networking-ops";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  userEmail: string;
  userName: string;
  subtitle?: string;
  activeTab?: "directory" | "requests" | "connections" | "messages";
  onTabChange?: (tab: "directory" | "requests" | "connections" | "messages") => void;
};

export function NetworkingModule({ userEmail, userName, subtitle, activeTab = "directory", onTabChange }: Props) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("All");
  const [subTheme, setSubTheme] = useState("All");
  const [connectOpen, setConnectOpen] = useState<{ email: string; name: string } | null>(null);
  const [connectMsg, setConnectMsg] = useState("");
  const [activeChat, setActiveChat] = useState<{ email: string; name: string } | null>(null);
  const [messageQ, setMessageQ] = useState("");
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<{ dataUrl: string; name: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => {
    const set = new Set(store.attendeeProfiles.map((p) => p.country));
    return ["All", ...Array.from(set).sort()];
  }, [store.attendeeProfiles]);

  const directory = getPublicDirectory({ q, country, subTheme }).filter((p) => p.email !== userEmail);

  const incoming = store.connectionRequests.filter((r) => r.toEmail === userEmail);
  const outgoing = store.connectionRequests.filter((r) => r.fromEmail === userEmail);
  const connections = getConnectionsFor(userEmail);
  const conversations = useMemo(() => getConversationSummaries(userEmail), [store.connectionRequests, store.chatMessages, userEmail]);
  const messages = activeChat ? getThreadMessages(userEmail, activeChat.email) : [];
  const activeProfile = activeChat ? store.attendeeProfiles.find((p) => p.email === activeChat.email) : undefined;

  const messageGroups = useMemo(() => {
    const groups: { day: string; items: typeof messages }[] = [];
    for (const m of messages) {
      const day = formatChatDayLabel(m.sentAt);
      const last = groups[groups.length - 1];
      if (last?.day === day) last.items.push(m);
      else groups.push({ day, items: [m] });
    }
    return groups;
  }, [messages]);

  useEffect(() => {
    if (activeTab === "messages" && !activeChat && conversations.length > 0) {
      const first = conversations[0];
      setActiveChat({ email: first.email, name: first.name });
    }
  }, [activeTab, conversations.length, activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeChat?.email]);

  const sendRequest = () => {
    if (!connectOpen || !connectMsg.trim()) return;
    const res = sendConnectionRequest({ email: userEmail, name: userName }, connectOpen, connectMsg.trim());
    if (!res.ok) return toast.error(res.error);
    toast.success(`Connection request sent to ${connectOpen.name}`);
    setConnectOpen(null);
    setConnectMsg("");
  };

  const sendMsg = () => {
    if (!activeChat) return;
    const res = sendChatMessage({
      from: { email: userEmail, name: userName },
      toEmail: activeChat.email,
      body: draft,
      imageDataUrl: image?.dataUrl,
      fileName: image?.name,
    });
    if (!res.ok) return toast.error(res.error);
    setDraft("");
    setImage(null);
  };

  const readImage = (file: File) => {
    const r = new FileReader();
    r.onload = () => setImage({ dataUrl: r.result as string, name: file.name });
    r.readAsDataURL(file);
  };

  const filteredConversations = useMemo(() => {
    const q = messageQ.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      [c.name, c.profile?.org, c.profile?.title, c.lastMessage?.body].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [conversations, messageQ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Networking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {subtitle ?? "Discover delegates, connect, and message after acceptance. Control visibility in Profile."}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange?.(v as "directory" | "requests" | "connections" | "messages")}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="requests">Requests ({incoming.filter((r) => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="connections">Connected ({connections.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6">
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, org, country…" className="pl-9" />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full lg:w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={subTheme} onValueChange={setSubTheme}>
              <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="Sub-theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All themes</SelectItem>
                {SUB_THEMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {directory.map((p) => {
              const sent = outgoing.find((r) => r.toEmail === p.email);
              const connected = connections.some((c) => c.email === p.email);
              return (
                <div key={p.email} className="rounded-2xl bg-card border p-4 sm:p-5 hover-lift">
                  <div className="flex gap-3">
                    <img src={p.photo} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.title} · {p.org}</div>
                      <div className="text-xs text-muted-foreground">{p.country}</div>
                    </div>
                  </div>
                  {p.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.subThemeInterests.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{t}</span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    disabled={connected || sent?.status === "pending"}
                    className={cn("w-full mt-3", !connected && !sent && "gradient-blue text-accent-foreground")}
                    variant={connected || sent ? "outline" : "default"}
                    onClick={() => {
                      if (connected) {
                        setActiveChat({ email: p.email, name: p.name });
                        onTabChange?.("messages");
                        return;
                      }
                      setConnectOpen({ email: p.email, name: p.name });
                    }}
                  >
                    {connected ? (
                      <><MessageCircle className="h-3.5 w-3.5 mr-1" /> Message</>
                    ) : sent?.status === "pending" ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Requested</>
                    ) : (
                      <><UserPlus className="h-3.5 w-3.5 mr-1" /> Connect</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          {directory.length === 0 && (
            <p className="text-center py-12 text-muted-foreground text-sm">No public profiles match your filters.</p>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-8">
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Received ({incoming.filter((r) => r.status === "pending").length} pending)
            </h3>
            {incoming.filter((r) => r.status === "pending").length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {incoming.filter((r) => r.status === "pending").map((r) => {
                  const profile = store.attendeeProfiles.find((p) => p.email === r.fromEmail);
                  return (
                    <div key={r.id} className="rounded-xl border bg-card p-4 sm:p-5">
                      <div className="flex gap-3">
                        {profile?.photo && (
                          <img src={profile.photo} alt="" className="h-12 w-12 rounded-full object-cover shrink-0 border" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{r.fromName}</div>
                          {profile && (
                            <div className="text-xs text-muted-foreground truncate">
                              {profile.title ? `${profile.title} · ` : ""}{profile.org} · {profile.country}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">"{r.message}"</p>
                          <div className="text-[10px] text-muted-foreground mt-1">Requested {r.createdAt}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="gradient-blue text-accent-foreground"
                          onClick={() => {
                            respondConnectionRequest(r.id, true);
                            toast.success(`Connected with ${r.fromName}`);
                          }}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            respondConnectionRequest(r.id, false);
                            toast.info("Declined");
                          }}
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Sent ({outgoing.length})</h3>
            {outgoing.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outgoing requests yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {outgoing.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-4 text-sm">
                    <div className="flex justify-between gap-2 items-start">
                      <span className="font-medium">{r.toName}</span>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold shrink-0 px-2 py-0.5 rounded-full",
                          r.status === "accepted"
                            ? "bg-green/15 text-green"
                            : r.status === "declined"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800",
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">"{r.message}"</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connections.map((c) => {
              const conv = conversations.find((x) => x.email === c.email);
              return (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => {
                    setActiveChat({ email: c.email, name: c.name });
                    onTabChange?.("messages");
                  }}
                  className="rounded-xl border bg-card p-4 text-left hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {c.profile?.photo && (
                      <img src={c.profile.photo} alt="" className="h-11 w-11 rounded-full object-cover border shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.profile?.title ? `${c.profile.title} · ` : ""}{c.profile?.org}
                      </div>
                      {conv?.lastMessage?.body && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{conv.lastMessage.body}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-accent font-medium">Open conversation →</div>
                </button>
              );
            })}
          </div>
          {connections.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No connections yet.</p>}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="flex flex-col lg:flex-row h-[72vh] min-h-[520px] rounded-2xl border bg-card overflow-hidden shadow-sm">
            <aside className="lg:w-80 border-b lg:border-b-0 lg:border-r bg-secondary/20 flex flex-col">
              <div className="px-4 py-3 border-b shrink-0 space-y-2">
                <div className="font-semibold text-sm">Conversations</div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={messageQ}
                    onChange={(e) => setMessageQ(e.target.value)}
                    placeholder="Search people..."
                    className="pl-9 h-9 bg-background"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.map((c) => {
                  const preview =
                    c.lastMessage?.body ??
                    (c.lastMessage?.fromEmail === userEmail ? "You sent an attachment" : "No messages yet");
                  const isActive = activeChat?.email === c.email;
                  return (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => setActiveChat({ email: c.email, name: c.name })}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-xl mb-1 flex gap-3 transition-colors",
                        isActive ? "bg-card border shadow-sm" : "hover:bg-card/70",
                      )}
                    >
                      {c.profile?.photo ? (
                        <img src={c.profile.photo} alt="" className="h-10 w-10 rounded-full object-cover shrink-0 border" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-1 items-baseline">
                          <span className="font-medium text-sm truncate">{c.name}</span>
                          {c.lastMessage && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {formatChatTime(c.lastMessage.sentAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{preview}</p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" aria-label="Unread" />
                      )}
                    </button>
                  );
                })}
                {filteredConversations.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3 text-center">Accept a connection request to start messaging.</p>
                )}
              </div>
            </aside>
            <div className="flex-1 flex flex-col min-h-0">
              {activeChat ? (
                <>
                  <div className="px-4 py-3 border-b flex items-center gap-3 bg-card/80">
                    {activeProfile?.photo && (
                      <img src={activeProfile.photo} alt="" className="h-9 w-9 rounded-full object-cover border" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{activeChat.name}</div>
                      {activeProfile && (
                        <div className="text-xs text-muted-foreground truncate">
                          {activeProfile.org} · {activeProfile.country}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {messageGroups.map((group) => (
                      <div key={group.day} className="mb-6">
                        <div className="flex justify-center mb-4">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
                            {group.day}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {group.items.map((m) => {
                            const mine = m.fromEmail === userEmail;
                            return (
                              <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                                <div
                                  className={cn(
                                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                                    mine ? "bg-accent text-accent-foreground rounded-br-md" : "bg-secondary rounded-bl-md",
                                  )}
                                >
                                  {!mine && <div className="text-[10px] font-medium opacity-80 mb-1">{m.fromName}</div>}
                                  {m.body && <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>}
                                  {m.imageDataUrl && (
                                    <img
                                      src={m.imageDataUrl}
                                      alt={m.fileName ?? "attachment"}
                                      className="mt-2 max-h-48 rounded-lg border"
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">{formatChatTime(m.sentAt)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-12">No messages in this thread yet. Say hello!</p>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  {canMessage(userEmail, activeChat.email) ? (
                    <div className="p-3 border-t space-y-2">
                      {image && (
                        <div className="relative inline-block">
                          <img src={image.dataUrl} alt="" className="h-16 rounded border" />
                          <button type="button" className="absolute -top-1 -right-1 text-xs bg-card border rounded-full px-1" onClick={() => setImage(null)}>×</button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" rows={2} className="resize-none flex-1" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} />
                        <div className="flex flex-col gap-1">
                          <Label className="sr-only">Image</Label>
                          <label className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background cursor-pointer hover:bg-secondary">
                            <ImageIcon className="h-4 w-4" />
                            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && readImage(e.target.files[0])} />
                          </label>
                          <Button type="button" size="icon" className="gradient-blue text-accent-foreground" onClick={sendMsg}><Send className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="p-4 text-xs text-muted-foreground border-t">Messaging disabled — check connection and privacy settings.</p>
                  )}
                </>
              ) : (
                <p className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8">Select a connection to start chatting.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!connectOpen} onOpenChange={() => setConnectOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request to connect — {connectOpen?.name}</DialogTitle></DialogHeader>
          <div>
            <Label>Message</Label>
            <Textarea value={connectMsg} onChange={(e) => setConnectMsg(e.target.value)} rows={4} className="mt-1" placeholder="Introduce yourself and why you'd like to connect…" />
          </div>
          <p className="text-xs text-muted-foreground">Both parties receive an email notification (simulated in this prototype).</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(null)}>Cancel</Button>
            <Button onClick={sendRequest} className="gradient-blue text-accent-foreground">Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
