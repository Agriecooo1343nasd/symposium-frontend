import { DEFAULT_SYMPOSIUM_SLUG } from "./constants";

export const queryKeys = {
  symposium: {
    all: ["symposium"] as const,
    bySlug: (slug: string = DEFAULT_SYMPOSIUM_SLUG) => ["symposium", "slug", slug] as const,
    list: (params?: Record<string, unknown>) => ["symposium", "list", params] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    bySymposium: (symposiumId: string, params?: Record<string, unknown>) =>
      ["sessions", symposiumId, params] as const,
    detail: (id: string) => ["sessions", "detail", id] as const,
    admin: (params?: Record<string, unknown>) => ["sessions", "admin", params] as const,
    tracks: (symposiumId: string) => ["tracks", symposiumId] as const,
    tracksAdmin: (symposiumId: string) => ["tracks", "admin", symposiumId] as const,
  },
  speakers: {
    all: ["speakers"] as const,
    bySymposium: (symposiumId: string, params?: Record<string, unknown>) =>
      ["speakers", symposiumId, params] as const,
    detail: (id: string) => ["speakers", "detail", id] as const,
    dashboard: ["speakers", "me", "dashboard"] as const,
    admin: (symposiumId: string, params?: Record<string, unknown>) =>
      ["speakers", "admin", symposiumId, params] as const,
  },
  ticketCategories: {
    public: (symposiumId: string) => ["ticket-categories", "public", symposiumId] as const,
    admin: (symposiumId: string) => ["ticket-categories", "admin", symposiumId] as const,
  },
  registrations: {
    mine: ["registrations", "me"] as const,
    detail: (id: string) => ["registrations", id] as const,
    admin: (params?: Record<string, unknown>) => ["registrations", "admin", params] as const,
    receipt: (id: string) => ["registrations", "receipt", id] as const,
  },
  payments: {
    transaction: (id: string) => ["payments", id] as const,
  },
  announcements: {
    public: (params?: Record<string, unknown>) => ["announcements", "public", params] as const,
    detail: (slug: string) => ["announcements", "slug", slug] as const,
    admin: (params?: Record<string, unknown>) => ["announcements", "admin", params] as const,
  },
  cms: {
    page: (key: string, symposiumId?: string) => ["cms", "page", key, symposiumId] as const,
    faqs: (symposiumId?: string) => ["cms", "faqs", symposiumId] as const,
    pressKit: (symposiumId?: string) => ["cms", "press-kit", symposiumId] as const,
    mediaAccreditations: (params?: Record<string, unknown>) =>
      ["cms", "media-accreditations", params] as const,
    mediaAccreditationStats: ["cms", "media-accreditation-stats"] as const,
  },
  sponsors: {
    bySymposium: (symposiumId: string) => ["sponsors", symposiumId] as const,
    admin: (params?: Record<string, unknown>) => ["sponsors", "admin", params] as const,
  },
  exhibitors: {
    me: ["exhibitors", "me"] as const,
    materials: ["exhibitors", "me", "materials"] as const,
    staffPasses: ["exhibitors", "me", "staff-passes"] as const,
    admin: (params?: Record<string, unknown>) => ["exhibitors", "admin", params] as const,
  },
  speakerMaterials: {
    bySession: (sessionId: string) => ["speaker-materials", sessionId] as const,
  },
  users: {
    me: ["users", "me"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", id] as const,
  },
  attendance: {
    pending: ["attendance", "pending-verifications"] as const,
    history: (registrationId: string) => ["attendance", registrationId] as const,
  },
  admin: {
    recentRegistrations: (symposiumId: string) => ["admin", "recent-registrations", symposiumId] as const,
    recentActivities: ["admin", "recent-activities"] as const,
    deskAudit: (symposiumId: string) => ["admin", "desk-audit", symposiumId] as const,
    auditLogs: (params?: Record<string, unknown>) => ["admin", "audit-logs", params] as const,
  },
  finance: {
    transactions: (params?: Record<string, unknown>) => ["finance", "transactions", params] as const,
    refunds: (params?: Record<string, unknown>) => ["finance", "refunds", params] as const,
    summary: (symposiumId?: string) => ["finance", "summary", symposiumId] as const,
  },
  auth: {
    session: ["auth", "session"] as const,
  },
  notifications: {
    mine: (params?: Record<string, unknown>) => ["notifications", "me", params] as const,
  },
  schedules: {
    mine: (params?: Record<string, unknown>) => ["schedules", "me", params] as const,
  },
  refunds: {
    mine: ["refund-requests", "me"] as const,
  },
  submissions: {
    mine: ["submissions", "me"] as const,
    detail: (id: string) => ["submissions", id] as const,
    admin: (params?: Record<string, unknown>) => ["submissions", "admin", params] as const,
  },
  certificates: {
    mine: ["certificates", "me"] as const,
  },
  roles: {
    all: ["roles"] as const,
    permissions: ["permissions"] as const,
  },
} as const;
