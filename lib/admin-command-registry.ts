export type AdminCommand = {
  id: string;
  label: string;
  description?: string;
  href: string;
  /** Opens a dialog or inline form on the target page */
  action?: string;
  /** Selects a tab (path segment or ?tab= query) */
  tab?: string;
  keywords: string[];
  group: string;
};

function nav(
  id: string,
  label: string,
  href: string,
  keywords: string[],
  description?: string,
): AdminCommand {
  return { id, label, href, keywords, group: "Pages", description };
}

function add(
  id: string,
  label: string,
  href: string,
  action: string,
  keywords: string[],
  description?: string,
  tabId?: string,
): AdminCommand {
  return { id, label, href, action, keywords, group: "Add & create", description, tab: tabId };
}

function tab(
  id: string,
  label: string,
  href: string,
  tabId: string,
  keywords: string[],
  description?: string,
): AdminCommand {
  return { id, label, href, tab: tabId, keywords, group: "Tabs & sections", description };
}

export const ADMIN_COMMANDS: AdminCommand[] = [
  // ── Pages (main nav) ──────────────────────────────────────────────────────
  nav("page-overview", "Overview", "/admin", ["dashboard", "home", "command", "centre", "snapshot"]),
  nav("page-registrations", "Registrations", "/admin/registrations", ["attendees", "delegates", "manual", "groups", "individual"]),
  nav("page-media", "Media / Press", "/admin/media", ["press", "journalist", "accreditation", "camera"]),
  nav("page-refunds", "Refunds & waitlist", "/admin/refunds", ["cancellation", "refund", "transfer", "waitlist", "capacity"]),
  nav("page-ticket-plans", "Pass plans", "/admin/ticket-plans", ["pricing", "tickets", "categories", "plans", "pass"]),
  nav("page-finance", "Finance", "/admin/finance", ["revenue", "payments", "invoices", "bank", "money"]),
  nav("page-programme", "Programme", "/admin/programme", ["sessions", "schedule", "run of show", "rooms", "moderation"]),
  nav("page-speakers", "Speakers", "/admin/speakers", ["speaker", "directory", "onboarding"]),
  nav("page-abstracts", "Speaker apps", "/admin/abstracts", ["abstract", "application", "review", "submissions"]),
  nav("page-exhibitors", "Exhibitors", "/admin/exhibitors/exhibitors", ["exhibitor", "booth", "sponsor", "organizations"]),
  nav("page-certificate", "Certificate", "/admin/certificate", ["template", "designer", "certificate", "award"]),
  nav("page-surveys", "Surveys", "/admin/surveys", ["feedback", "post-event", "responses"]),
  nav("page-committee", "Committee", "/admin/committee", ["organizing", "about", "members"]),
  nav("page-news", "News", "/admin/news", ["cms", "articles", "blog", "publish"]),
  nav("page-networking", "Networking", "/admin/networking/directory", ["connect", "messages", "directory", "chat"]),
  nav("page-polls", "Live polls", "/admin/polls", ["vote", "voting", "plenary", "poll", "live"]),
  nav("page-checkin", "Check-in", "/admin/checkin", ["qr", "scan", "attendance", "desk"]),
  nav("page-communications", "Communications", "/admin/communications", ["email", "sms", "announcement", "broadcast"]),
  nav("page-content", "Content", "/admin/content", ["public", "site", "pages", "faq"]),
  nav("page-analytics", "Analytics", "/admin/analytics", ["stats", "metrics", "reports"]),
  nav("page-users", "Users & Roles", "/admin/users", ["invite", "roles", "staff", "audit", "permissions"]),
  nav("page-desk", "Desk audit", "/admin/desk", ["registration desk", "queue", "read-only"]),
  nav("page-settings", "Settings", "/admin/settings", ["platform", "flags", "countries", "event config"]),

  // ── Exhibitor tabs ────────────────────────────────────────────────────────
  tab("exhibitors-tab", "Exhibitors list", "/admin/exhibitors/exhibitors", "exhibitors", ["exhibitor", "booth", "organizations"]),
  tab("sponsors-tab", "Sponsorship records", "/admin/exhibitors/sponsors", "sponsors", ["sponsor", "sponsorship", "invoice", "deliverables", "records"]),
  tab("applications-tab", "Exhibitor applications", "/admin/exhibitors/applications", "applications", ["apply", "pending", "approve", "reject"]),
  tab("tiers-tab", "Sponsorship tier benefits", "/admin/exhibitors/tiers", "tiers", ["platinum", "gold", "silver", "benefits", "pricing"]),
  tab("map-tab", "Booth map", "/admin/exhibitors/map", "map", ["floor plan", "booth map", "layout"]),
  tab("exhibitor-analytics-tab", "Exhibitor analytics", "/admin/exhibitors/analytics", "analytics", ["leads", "views", "downloads"]),

  // ── Finance tabs ──────────────────────────────────────────────────────────
  tab("finance-overview", "Finance overview", "/admin/finance", "overview", ["revenue", "charts", "summary"]),
  tab("finance-transactions", "All payments", "/admin/finance", "transactions", ["transactions", "payments", "history"]),
  tab("finance-sponsorship", "Sponsorship invoices", "/admin/finance", "sponsorship", ["sponsor", "invoice", "proforma"]),
  tab("finance-bank", "Bank transfers", "/admin/finance", "bank", ["bank", "transfer", "pending", "reconcile"]),
  tab("finance-reports", "Finance reports", "/admin/finance", "reports", ["export", "vat", "reconciliation"]),
  tab("finance-settings", "Finance settings", "/admin/finance", "settings", ["group discount", "vat"]),

  // ── Other tabs ────────────────────────────────────────────────────────────
  tab("registrations-groups", "Group registrations", "/admin/registrations", "groups", ["group", "delegation", "team"]),
  tab("refunds-cancellations", "Cancellation requests", "/admin/refunds", "cancellations", ["cancel", "refund", "pending"]),
  tab("refunds-waitlist", "Waitlist", "/admin/refunds", "waitlist", ["wait", "capacity", "notify"]),
  tab("media-pending", "Pending media apps", "/admin/media", "pending", ["press", "accreditation", "review"]),
  tab("programme-timeline1", "Run of show Day 1", "/admin/programme", "timeline1", ["moderation", "live", "day 1"]),
  tab("programme-rooms", "Venue rooms", "/admin/programme", "rooms", ["room", "hall", "capacity"]),
  tab("users-invites", "User invitations", "/admin/users", "invites", ["invite", "pending", "staff"]),
  tab("communications-announce", "In-app announcements", "/admin/communications", "announce", ["banner", "in-app", "alert"]),
  tab("networking-requests", "Connection requests", "/admin/networking/requests", "requests", ["connect", "pending"]),
  tab("checkin-scan", "QR scan check-in", "/admin/checkin", "scan", ["qr", "camera", "scan"]),

  // ── Add & create ──────────────────────────────────────────────────────────
  add("add-manual-registration", "Manual registration", "/admin/registrations", "manual-registration", [
    "add", "create", "register", "attendee", "comp", "manual", "new registration",
  ], "Create a paid or comp registration from the secretariat"),
  add("add-announcement", "Send announcement", "/admin/communications", "new-announcement", [
    "add", "create", "announce", "banner", "broadcast", "in-app", "alert", "message",
  ], "Push an in-app announcement to portals", "announce"),
  add("add-exhibitor", "Add exhibitor", "/admin/exhibitors/exhibitors", "add-exhibitor", [
    "add", "create", "new", "exhibitor", "booth", "organization", "manual",
  ], "Manually create and approve an exhibitor"),
  add("add-sponsor", "Add sponsor", "/admin/exhibitors/sponsors", "add-sponsor", [
    "add", "create", "new", "sponsor", "sponsorship", "platinum", "gold", "silver",
  ], "Manually create and approve a sponsor package"),
  add("add-booth", "New booth", "/admin/exhibitors/map", "new-booth", [
    "add", "create", "new", "booth", "map", "floor", "stand",
  ], "Add a booth to the floor map"),
  add("add-speaker", "Add speaker", "/admin/speakers", "add-speaker", [
    "add", "create", "new", "speaker", "presenter", "manual",
  ], "Onboard a speaker with registration"),
  add("add-session", "Add session", "/admin/programme", "add-session", [
    "add", "create", "new", "session", "workshop", "plenary", "programme",
  ], "Add a programme session"),
  add("add-room", "Add room", "/admin/programme", "add-room", [
    "add", "create", "new", "room", "hall", "venue",
  ], "Add a venue room"),
  add("add-pass-plan", "Add pass plan", "/admin/ticket-plans", "add-plan", [
    "add", "create", "new", "ticket", "plan", "pricing", "category", "pass",
  ], "Create a delegate pass plan"),
  add("add-poll", "New live poll", "/admin/polls", "new-poll", [
    "add", "create", "new", "poll", "vote", "voting", "plenary", "question",
  ], "Create a draft live poll"),
  add("add-news-article", "New news article", "/admin/news", "new-article", [
    "add", "create", "new", "news", "article", "blog", "publish", "cms",
  ], "Compose a news post"),
  add("add-committee-member", "New committee member", "/admin/committee", "new-member", [
    "add", "create", "new", "committee", "member", "organizing", "about",
  ], "Add a member to the organizing committee"),
  add("invite-user", "Invite user", "/admin/users", "invite-user", [
    "add", "create", "invite", "staff", "admin", "moderator", "user", "role",
  ], "Send a portal invitation"),

  // ── Quick links (queues / actions) ────────────────────────────────────────
  nav("pending-exhibitor-apps", "Pending exhibitor applications", "/admin/exhibitors/applications", [
    "pending", "review", "exhibitor", "sponsor", "apply",
  ], "Review organization applications"),
  nav("pending-speaker-apps", "Pending speaker applications", "/admin/abstracts", [
    "pending", "review", "speaker", "abstract",
  ]),
  nav("pending-media", "Pending media accreditation", "/admin/media", ["pending", "press", "media"]),
  nav("open-checkin", "Open check-in", "/admin/checkin", ["qr", "scan", "attendance"]),
  nav("open-desk", "Open desk portal", "/desk", ["desk", "registration", "live"]),
  nav("public-news", "Public news page", "/news", ["public", "website", "preview"]),
  nav("public-programme", "Public programme", "/programme", ["public", "schedule"]),
  nav("public-exhibitors", "Public exhibitors page", "/exhibitors", ["public", "sponsors"]),
];

export function buildCommandHref(cmd: AdminCommand): string {
  const [path, existingQuery] = cmd.href.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  if (cmd.tab) params.set("tab", cmd.tab);
  if (cmd.action) params.set("action", cmd.action);
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

export function filterAdminCommands(query: string): AdminCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return ADMIN_COMMANDS;
  return ADMIN_COMMANDS.filter((c) => {
    const hay = [c.label, c.description ?? "", c.group, ...c.keywords].join(" ").toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  });
}

export function groupAdminCommands(commands: AdminCommand[]): Map<string, AdminCommand[]> {
  const map = new Map<string, AdminCommand[]>();
  for (const c of commands) {
    const list = map.get(c.group) ?? [];
    list.push(c);
    map.set(c.group, list);
  }
  return map;
}
