import {
  TICKET_CATEGORIES,
  SESSIONS,
  REGISTRATIONS,
  APPLICATIONS,
  ABSTRACTS,
  ADMIN_USERS,
  AUDIT_LOG,
  EXHIBITORS,
  EVENT,
  NEWS,
  ROOMS,
  SPEAKERS,
  type TicketCategory,
  type Role,
  type SubTheme,
  type Session,
  type NewsPost,
  type ParticipationKind,
} from "./mock-data";
import {
  getServerGroupRegistrationSettings,
  type GroupRegistrationSettings,
} from "./group-registration-policy";
import type { ZoomMeeting } from "./zoom-mock";

const STORE_KEY = "nas2026_data";
const STORE_VERSION = 20;

const LISTENERS = new Set<() => void>();

// ── Types ────────────────────────────────────────────────────────────────────

export type UserStatus = "active" | "suspended" | "invited";

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLogin: string;
  organization?: string;
};

export type UserInvite = {
  id: string;
  name: string;
  email: string;
  role: Role;
  sentAt: string;
  status: "pending" | "accepted" | "revoked";
};

export type AuditEntry = {
  id: string;
  who: string;
  action: string;
  target: string;
  at: string;
};

export type TicketPlan = TicketCategory & {
  subtitle?: string;
  requiresVerification?: "student" | "farmer" | null;
  /** Complimentary press accreditation — no payment step */
  isMediaAccreditation?: boolean;
  /** Max paid/comp seats; waitlist when full */
  capacity: number;
  /** Force sold-out regardless of count */
  soldOutOverride?: boolean;
};

export type MediaPressType = "tv" | "radio" | "print" | "digital" | "photo" | "other";

export type MediaApplication = {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  jobTitle: string;
  pressName: string;
  pressType: MediaPressType;
  pressWebsite: string;
  pressCountry: string;
  editorName?: string;
  editorEmail?: string;
  coverageBrief: string;
  socialHandle?: string;
  credentialFileName: string;
  credentialDataUrl?: string;
  letterFileName: string;
  letterDataUrl?: string;
  assignmentFileName?: string;
  assignmentDataUrl?: string;
  status: "pending" | "approved" | "rejected";
  reviewMessage?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
};

export type RegistrationDetails = {
  ticketId: string;
  title?: string;
  org: string;
  phone?: string;
  dietary?: string;
  access?: string;
  hear?: string;
  linkedin?: string;
  interests?: string[];
  paymentMethod?: string;
  roleNote?: string;
};

export type StoreRegistration = {
  id: string;
  name: string;
  email: string;
  country: string;
  category: string;
  categoryId: string;
  amountUsd: number;
  status: "paid" | "pending" | "comp";
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  createdAt: string;
  details?: RegistrationDetails;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkInType?: "delegate" | "exhibitor_staff" | "booth_comp";
  certificateGranted?: boolean;
  /** Group registration (FR-2.3) */
  groupId?: string;
  groupRole?: "representative" | "member";
};

export type { GroupRegistrationSettings } from "./group-registration-policy";

export const DEFAULT_GROUP_REGISTRATION_SETTINGS = getServerGroupRegistrationSettings();

export type GroupRegistration = {
  id: string;
  code: string;
  orgName: string;
  representativeRegistrationId: string;
  representativeEmail: string;
  representativeName: string;
  country: string;
  categoryId: string;
  categoryName: string;
  memberCount: number;
  memberRegistrationIds: string[];
  pricePerSeatUsd: number;
  subtotalUsd: number;
  discountPercent: number;
  discountUsd: number;
  totalUsd: number;
  status: "paid" | "pending" | "comp";
  paymentMethod?: string;
  createdAt: string;
};

export type ExhibitorLeadStatus = "None" | "Contacted" | "In Discussion" | "Converted";

export type ExhibitorLeadHistoryEntry = {
  at: string;
  note: string;
  by?: string;
};

export type ExhibitorLead = {
  id: string;
  orgId: string;
  registrationId?: string;
  attendeeEmail: string;
  ticketId?: string;
  name: string;
  title: string;
  org: string;
  country: string;
  phone?: string;
  email: string;
  /** Sub-themes / interests from attendee profile */
  interests: string[];
  /** Short summary for tables */
  interest: string;
  capturedAt: string;
  capturedAtIso: string;
  captureMethod: "qr_scan" | "manual";
  scannedBy?: string;
  boothNotes?: string;
  status: ExhibitorLeadStatus;
  consentGranted: boolean;
  history: ExhibitorLeadHistoryEntry[];
};

export type ExhibitorStaff = {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: string;
  status: "Invited" | "Confirmed";
  inviteToken?: string;
};

export type CheckInScan = {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  category: string;
  scanType: "delegate" | "exhibitor_staff" | "booth_comp";
  scannedAt: string;
  scannedBy: string;
  orgName?: string;
};

export type SpeakerAbstractDoc = {
  id: string;
  speakerEmail: string;
  title: string;
  authors: string;
  track: SubTheme;
  body: string;
  documentName: string;
  documentDataUrl?: string;
  status: "submitted" | "under-review" | "accepted" | "rejected";
  submittedAt: string;
};

export type DocumentVerification = {
  id: string;
  registrationId: string;
  registrantName: string;
  registrantEmail: string;
  type: "student" | "farmer";
  fileName: string;
  fileDataUrl?: string;
  status: "pending" | "approved" | "rejected";
  reviewMessage?: string;
  submittedAt: string;
};

export type PresentationType = "Keynote" | "Panel" | "Workshop" | "Poster";

export type SpeakerApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  photoUrl?: string;
  about: string;
  title: string;
  summary: string;
  presentationType: PresentationType;
  documentName?: string;
  documentDataUrl?: string;
  status: "pending" | "approved" | "rejected";
  reviewMessage?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
};

export type OrgType = "startup" | "ngo" | "university" | "research" | "company";
export type ParticipationType = "exhibitor" | "sponsor" | "both";
export type SponsorshipTier = "Platinum" | "Gold" | "Silver";

export type SponsorshipTierConfig = {
  tier: SponsorshipTier;
  benefits: string[];
  staffPasses: number;
  brochureSlots: number;
  leadCapture: boolean;
  speakingSlot: boolean;
  homepageFeature: boolean;
  newsletterMention: boolean;
  boothListing: boolean;
  /** Admin-set booth package fee (USD) */
  baseFeeUsd: number;
  /** Per extra staff beyond includedStaff */
  extraStaffFeeUsd: number;
};

export type ExhibitorBoothPackage = {
  baseFeeUsd: number;
  includedStaff: number;
  extraStaffFeeUsd: number;
  description: string;
};

export type SessionMaterial = {
  id: string;
  sessionId: string;
  fileName: string;
  fileDataUrl?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  kind: "presentation" | "handout" | "abstract" | "recording";
  uploadedAt: string;
};

export type SpeakerAvReviewStatus = "pending" | "approved" | "changes_requested";

export type SpeakerAvRequirements = {
  speakerEmail: string;
  presentationTool: "venue" | "own";
  microphone: "lavalier" | "handheld" | "headset";
  needsInternet: boolean;
  includesVideo: boolean;
  specialEquipment?: string;
  status: SpeakerAvReviewStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  venueNotes?: string;
};

export type SpeakerDeckFile = {
  id: string;
  speakerEmail: string;
  fileName: string;
  fileDataUrl?: string;
  uploadedAt: string;
};

export type OrganizationApplication = {
  id: string;
  companyName: string;
  orgType: OrgType;
  website: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  participation: ParticipationType;
  sponsorshipTier?: SponsorshipTier;
  boothPreference?: string;
  logoFileName?: string;
  staffCount?: number;
  /** Booth team invite emails (manual onboarding / edits) */
  staffMemberEmails?: string[];
  quotedFeeUsd?: number;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "unpaid" | "paid" | "comp";
  boothAssignment?: string;
  preferredBoothId?: string;
  submittedAt: string;
  reviewMessage?: string;
};

export type ApprovedOrganization = {
  id: string;
  applicationId: string;
  name: string;
  participation: ParticipationType;
  sponsorshipTier?: SponsorshipTier;
  booth: string;
  category: string;
  description: string;
  contact: string;
  leads: number;
  profileViews: number;
  brochureDownloads: number;
  sponsorshipContractRef?: string;
  sponsorshipPaidThrough?: string;
  speakingSlot?: string;
};

export type SponsorshipDeliverableStatus = "pending" | "in_review" | "approved" | "live";

export type SponsorshipDeliverable = {
  id: string;
  orgId: string;
  title: string;
  description: string;
  channel: "homepage" | "newsletter" | "programme" | "signage" | "opening" | "app";
  status: SponsorshipDeliverableStatus;
  dueDate: string;
  submittedAt?: string;
  liveAt?: string;
  secretariatNote?: string;
};

export type SessionRating = {
  id: string;
  sessionId: string;
  attendeeEmail: string;
  attendeeName: string;
  stars: number;
  comment?: string;
  submittedAt: string;
};

export type SponsorshipInvoiceStatus = "issued" | "pending_payment" | "paid" | "cancelled";

export type SponsorshipInvoice = {
  id: string;
  reference: string;
  applicationId: string;
  orgId?: string;
  orgName: string;
  contactEmail: string;
  tier: SponsorshipTier;
  participation: ParticipationType;
  amountUsd: number;
  amountRwf: number;
  status: SponsorshipInvoiceStatus;
  type: "proforma";
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  issuedBy: string;
  notes?: string;
};

export type RunOfShowItem = {
  id: string;
  day: 1 | 2;
  order: number;
  title: string;
  startTime: string;
  endTime: string;
  type: "session" | "break" | "custom";
  sessionId?: string;
  status: "upcoming" | "live" | "done";
  dependsOn?: string;
  notes?: string;
  zoomMeetingId?: string;
  ownerName?: string;
  ownerEmail?: string;
};

export type RemoteInteraction = {
  id: string;
  type: "comment" | "question" | "reaction";
  author: string;
  authorEmail?: string;
  message: string;
  timestamp: string;
  status: "pending" | "approved" | "answered" | "dismissed";
  pinned?: boolean;
  runOfShowItemId?: string;
  location?: "virtual" | "in-person";
};

export type SessionRecording = {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  runOfShowItemId?: string;
  sessionId?: string;
  status: "processing" | "published";
  uploadedAt: string;
};

export type FeatureFlags = {
  registration: boolean;
  payments: boolean;
  ticketPlans: boolean;
  abstracts: boolean;
  speakerPortal: boolean;
  exhibitorPortal: boolean;
  programmePublished: boolean;
  liveStream: boolean;
  remoteQueue: boolean;
  checkIn: boolean;
  networking: boolean;
  certificates: boolean;
  survey: boolean;
  resourceRepository: boolean;
  maintenanceMode: boolean;
};

export type PlatformSettings = {
  eventName: string;
  shortName: string;
  theme: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  exchangeRate: number;
  timezone: string;
  platformUrl: string;
  countries: string[];
  features: FeatureFlags;
  cancellationPolicyText: string;
  refundProcessingDays: number;
  groupRegistration: GroupRegistrationSettings;
};

export type CancellationRequestType = "refund" | "transfer";

export type CancellationRequest = {
  id: string;
  registrationId: string;
  requesterEmail: string;
  requesterName: string;
  type: CancellationRequestType;
  reason: string;
  status: "pending" | "approved" | "rejected";
  refundAmountUsd?: number;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  transferToName?: string;
  transferToEmail?: string;
  createdAt: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  categoryId: string;
  categoryName: string;
  country?: string;
  org?: string;
  joinedAt: string;
  notified: boolean;
  notifiedAt?: string;
};

export type AttendeeProfile = {
  email: string;
  name: string;
  title?: string;
  org: string;
  country: string;
  photo?: string;
  bio?: string;
  linkedin?: string;
  interests: string[];
  subThemeInterests: SubTheme[];
  publicInDirectory: boolean;
  allowMessages: boolean;
  /** FR-5.2 — attendee consent for exhibitors to capture contact via booth QR scan */
  allowExhibitorContact: boolean;
};

export type StoreConnectionRequest = {
  id: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  body?: string;
  imageDataUrl?: string;
  fileName?: string;
  sentAt: string;
};

export type CertificateSignature = {
  name: string;
  title: string;
  imageUrl?: string;
};

export type CertificateStyle = {
  primaryColor: string;
  accentColor: string;
  showQr: boolean;
};

export type CertificateTemplate = {
  headline: string;
  subheadline: string;
  bodyLine: string;
  footerLine: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  signatures: CertificateSignature[];
  style?: CertificateStyle;
  /** Live preview on admin designer */
  previewName?: string;
  previewCategory?: string;
  previewTicketId?: string;
};

export type SurveyResponse = {
  id: string;
  respondentName: string;
  respondentEmail: string;
  overall: number;
  content: number;
  venue: number;
  networking: number;
  highlight: string;
  improve: string;
  recommend: string;
  submittedAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audiences: (Role | "all")[];
  createdAt: string;
  createdBy: string;
};

export type AnnouncementDismissal = {
  announcementId: string;
  email: string;
};

export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
  org: string;
  photo: string;
  bio: string;
  order: number;
};

export type GalleryImage = {
  id: string;
  src: string;
  caption: string;
  event: string;
  year: number;
  order: number;
};

export type SymposiumArchiveKind = "slides" | "overview" | "report" | "proceedings";

export type PreviousPresentation = {
  id: string;
  title: string;
  presenter: string;
  fileName: string;
  fileUrl: string;
  event: string;
  year: number;
  kind: SymposiumArchiveKind;
  order: number;
};

export type VenueRoom = {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  av: string;
};

export type BoothStatus = "available" | "reserved" | "occupied";

export type Booth = {
  id: string;
  code: string;
  row: number;
  col: number;
  capacity: number;
  location: string;
  assignedOrgId?: string;
  status: BoothStatus;
  dimensions?: string;
  floor?: string;
  includes?: string[];
  setupWindow?: string;
  breakdownWindow?: string;
  onSiteContact?: string;
  notes?: string;
};

export type SpeakerProfile = {
  id: string;
  name: string;
  title: string;
  org: string;
  country: string;
  flag: string;
  bio: string;
  photo: string;
  sessions: string[];
  email?: string;
};

export type PollStatus = "draft" | "open" | "closed";

export type PollAudienceConfig = {
  /** Empty = all roles may vote (except when combined with other filters). */
  roles: Role[];
  /** Empty = any ticket category. */
  ticketCategoryIds: string[];
  /** For exhibitor portal users — empty = any participation type. */
  participationKinds: ParticipationKind[];
};

export type LivePollOption = {
  id: string;
  label: string;
};

export type LivePoll = {
  id: string;
  title: string;
  question: string;
  description?: string;
  options: LivePollOption[];
  sessionId?: string;
  audience: PollAudienceConfig;
  status: PollStatus;
  /** When true (and poll closed or open), eligible users see live results. */
  resultsVisible: boolean;
  createdAt: string;
  createdBy: string;
  openedAt?: string;
  closedAt?: string;
};

export type PollVote = {
  id: string;
  pollId: string;
  optionId: string;
  voterEmail: string;
  voterName: string;
  voterRole: Role;
  votedAt: string;
};

export type AppStore = {
  version: number;
  users: PlatformUser[];
  invites: UserInvite[];
  auditLog: AuditEntry[];
  ticketPlans: TicketPlan[];
  registrations: StoreRegistration[];
  groupRegistrations: GroupRegistration[];
  documentVerifications: DocumentVerification[];
  speakerApplications: SpeakerApplication[];
  mediaApplications: MediaApplication[];
  organizationApplications: OrganizationApplication[];
  approvedOrganizations: ApprovedOrganization[];
  sponsorshipTiers: SponsorshipTierConfig[];
  sponsorshipDeliverables: SponsorshipDeliverable[];
  sessionRatings: SessionRating[];
  sponsorshipInvoices: SponsorshipInvoice[];
  runOfShow: RunOfShowItem[];
  zoomMeetings: ZoomMeeting[];
  remoteInteractions: RemoteInteraction[];
  recordings: SessionRecording[];
  exhibitorLeads: ExhibitorLead[];
  exhibitorStaff: ExhibitorStaff[];
  checkInScans: CheckInScan[];
  speakerAbstracts: SpeakerAbstractDoc[];
  sessions: Session[];
  exhibitorBoothPackage: ExhibitorBoothPackage;
  sessionMaterials: SessionMaterial[];
  speakerAvRequirements: SpeakerAvRequirements[];
  speakerDecks: SpeakerDeckFile[];
  platformSettings: PlatformSettings;
  certificateTemplate: CertificateTemplate;
  surveyResponses: SurveyResponse[];
  announcements: Announcement[];
  announcementDismissals: AnnouncementDismissal[];
  newsPosts: NewsPost[];
  committeeMembers: CommitteeMember[];
  galleryImages: GalleryImage[];
  previousPresentations: PreviousPresentation[];
  rooms: VenueRoom[];
  booths: Booth[];
  speakerProfiles: SpeakerProfile[];
  cancellationRequests: CancellationRequest[];
  waitlist: WaitlistEntry[];
  attendeeProfiles: AttendeeProfile[];
  connectionRequests: StoreConnectionRequest[];
  chatMessages: ChatMessage[];
  livePolls: LivePoll[];
  pollVotes: PollVote[];
};

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedRunOfShow(): RunOfShowItem[] {
  const owners = ["Dr. Mukeshimana Solange", "Jean-Baptiste Habimana", "Programme Committee"];
  return SESSIONS.map((s, i) => ({
    id: `ros-${s.id}`,
    day: s.day,
    order: i + 1,
    title: s.title,
    startTime: s.start,
    endTime: s.end,
    type: "session" as const,
    sessionId: s.id,
    status: (i < 5 ? "done" : "upcoming") as "upcoming" | "live" | "done",
    ownerName: i % 4 === 0 ? owners[i % owners.length] : undefined,
    ownerEmail: i % 4 === 0 ? "speaker@nas2026.rw" : undefined,
  }));
}

function seedDocumentVerifications(): DocumentVerification[] {
  const placeholder = "https://picsum.photos/seed/student/400/280";
  return [
    {
      id: "dv1",
      registrationId: "r5",
      registrantName: "Sarah Mwangi",
      registrantEmail: "sarah.m@example.ke",
      type: "student",
      fileName: "student-id-sarah.pdf",
      fileDataUrl: placeholder,
      status: "pending",
      submittedAt: "2026-04-20",
    },
    {
      id: "dv2",
      registrationId: "r4",
      registrantName: "Patrick Niyonzima",
      registrantEmail: "patrick@coop.rw",
      type: "farmer",
      fileName: "coop-letter-green-pastures.pdf",
      fileDataUrl: "https://picsum.photos/seed/farmer/400/280",
      status: "pending",
      submittedAt: "2026-04-17",
    },
    {
      id: "dv3",
      registrationId: "r1",
      registrantName: "Alice Uwimana",
      registrantEmail: "alice@example.rw",
      type: "student",
      fileName: "ur-student-card.jpg",
      fileDataUrl: "https://picsum.photos/seed/card2/400/280",
      status: "approved",
      submittedAt: "2026-04-12",
    },
  ];
}

function seedRemoteInteractions(): RemoteInteraction[] {
  const now = Date.now();
  return [
    { id: "ri1", type: "question", author: "Alice Uwimana", authorEmail: "alice@example.rw", message: "Will slides be shared after the plenary?", timestamp: new Date(now - 120000).toISOString(), status: "pending", location: "virtual" },
    { id: "ri2", type: "comment", author: "John Okello", authorEmail: "j.okello@example.ug", message: "Excellent point on soil health metrics.", timestamp: new Date(now - 90000).toISOString(), status: "pending", location: "virtual" },
    { id: "ri3", type: "reaction", author: "Maria Bonomi", message: "👏", timestamp: new Date(now - 60000).toISOString(), status: "approved", location: "virtual" },
    { id: "ri4", type: "question", author: "Marcus Weber", authorEmail: "weber@giz.de", message: "Is there a French interpretation channel?", timestamp: new Date(now - 30000).toISOString(), status: "pending", location: "in-person" },
    { id: "ri5", type: "comment", author: "Aisha Diop", message: "Request link to farmer cooperative toolkit.", timestamp: new Date(now - 15000).toISOString(), status: "pending", location: "virtual" },
  ];
}

function seedExhibitorLeads(): ExhibitorLead[] {
  const orgId = "ex1";
  const base = (partial: Omit<ExhibitorLead, "orgId" | "captureMethod" | "consentGranted" | "history" | "interests" | "capturedAtIso"> & {
    interests?: string[];
    capturedAtIso?: string;
    history?: ExhibitorLeadHistoryEntry[];
  }): ExhibitorLead => ({
    orgId,
    captureMethod: "qr_scan",
    consentGranted: true,
    interests: partial.interests ?? (partial.interest ? [partial.interest] : []),
    capturedAtIso: partial.capturedAtIso ?? "2026-08-13T11:02:00.000Z",
    history: partial.history ?? [{ at: partial.capturedAtIso ?? "2026-08-13T11:02:00.000Z", note: "Initial booth scan", by: "Eric Mukamana" }],
    ...partial,
  });

  return [
    base({
      id: "ld1",
      registrationId: "r1",
      attendeeEmail: "alice@example.rw",
      ticketId: "NAS26-R1-1000",
      name: "Alice Uwimana",
      title: "Programme Officer",
      org: "MINAGRI Rwanda",
      country: "Rwanda",
      phone: "+250 788 000 000",
      email: "alice@example.rw",
      interests: ["Soil Health", "Food Systems"],
      interest: "Drip irrigation kits for hillside cooperatives",
      capturedAt: "Day 1 · 11:02",
      capturedAtIso: "2026-08-13T11:02:00.000Z",
      boothNotes: "Wants demo of solar pump kit — follow up after plenary.",
      status: "Contacted",
      scannedBy: "Eric Mukamana",
      history: [
        { at: "2026-08-13T11:02:00.000Z", note: "Badge scanned at booth A-12", by: "Eric Mukamana" },
        { at: "2026-08-13T14:20:00.000Z", note: "Sent product catalog PDF", by: "Liliane Niwemugeni" },
      ],
    }),
    base({
      id: "ld2",
      registrationId: "r2",
      attendeeEmail: "j.okello@example.ug",
      ticketId: "NAS26-R2-1001",
      name: "John Okello",
      title: "Director",
      org: "FarmerCoop Uganda",
      country: "Uganda",
      phone: "+250 788 000 001",
      email: "j.okello@example.ug",
      interests: ["Food Systems", "Climate Resilience"],
      interest: "Compact tools demo for cooperative network",
      capturedAt: "Day 1 · 14:45",
      capturedAtIso: "2026-08-13T14:45:00.000Z",
      boothNotes: "12-member delegation — group pricing requested.",
      status: "In Discussion",
      scannedBy: "Innocent Habiyaremye",
    }),
    base({
      id: "ld3",
      registrationId: "r4",
      attendeeEmail: "patrick@coop.rw",
      ticketId: "NAS26-R4-1003",
      name: "Patrick Niyonzima",
      title: "Founder",
      org: "Green Pastures Cooperative",
      country: "Rwanda",
      email: "patrick@coop.rw",
      interests: ["Soil Health", "Farmer Innovation"],
      interest: "Bulk pricing for cooperative members",
      capturedAt: "Day 2 · 10:11",
      capturedAtIso: "2026-08-14T10:11:00.000Z",
      boothNotes: "Ready to pilot 50-unit order in Q4.",
      status: "Converted",
      scannedBy: "Eric Mukamana",
    }),
    base({
      id: "ld4",
      registrationId: "r3",
      attendeeEmail: "m.bonomi@university.it",
      ticketId: "NAS26-R3-1002",
      name: "Maria Bonomi",
      title: "Researcher",
      org: "University / NGO",
      country: "Italy",
      email: "m.bonomi@university.it",
      interests: ["Soil Health"],
      interest: "Research collaboration on soil metrics",
      capturedAt: "Day 1 · 16:30",
      capturedAtIso: "2026-08-13T16:30:00.000Z",
      boothNotes: "Interested in EU partnership MOU.",
      status: "None",
      scannedBy: "Liliane Niwemugeni",
    }),
  ];
}

function seedExhibitorStaff(): ExhibitorStaff[] {
  return [
    { id: "st1", orgId: "ex1", name: "Eric Mukamana", email: "eric@agritools.rw", role: "Booth Lead", status: "Confirmed" },
    { id: "st2", orgId: "ex1", name: "Liliane Niwemugeni", email: "liliane@agritools.rw", role: "Sales", status: "Confirmed" },
    { id: "st3", orgId: "ex1", name: "Innocent Habiyaremye", email: "innocent@agritools.rw", role: "Technical Demo", status: "Invited", inviteToken: "invite-demo-staff" },
  ];
}

function seedRegistrations(): StoreRegistration[] {
  return REGISTRATIONS.map((r, i) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    country: r.country,
    category: r.category,
    categoryId: TICKET_CATEGORIES.find((c) => c.name === r.category)?.id ?? "intl",
    amountUsd: r.amountUsd,
    status: r.status,
    verificationStatus: r.category.includes("Student") ? "pending" : r.category.includes("Farmer") ? "pending" : "none",
    createdAt: r.createdAt,
    checkedIn: i < 2,
    details: {
      ticketId: `NAS26-${r.id.toUpperCase()}-${1000 + i}`,
      title: i === 0 ? "Programme Officer" : "Researcher",
      org: i === 0 ? "MINAGRI Rwanda" : "University / NGO",
      phone: "+250 788 000 00" + i,
      dietary: i % 2 === 0 ? "Vegetarian" : "None",
      access: i === 1 ? "Wheelchair access near plenary" : "",
      hear: "Email newsletter",
      linkedin: "",
      interests: ["Soil Health", "Food Systems"].slice(0, (i % 2) + 1),
      paymentMethod: "momo",
    },
  }));
}

function seedUsers(): PlatformUser[] {
  const roleMap: Record<string, Role> = {
    "Super Admin": "admin",
    "Finance Officer": "admin",
    "Programme Committee": "admin",
    "Registration Desk": "registration_desk",
    "Exhibitor Manager": "admin",
    "Speaker Coordinator": "admin",
  };
  return ADMIN_USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: roleMap[u.role] ?? "admin",
    status: u.active ? "active" : "suspended",
    lastLogin: u.lastLogin,
  }));
}

function seedSpeakerApplications(): SpeakerApplication[] {
  const fromApps = APPLICATIONS.filter((a) => a.kind === "speaker").map((a, i) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: i === 0 ? "+250 788 111 222" : "+234 803 456 7890",
    country: i === 0 ? "Rwanda" : "Nigeria",
    photoUrl: `https://i.pravatar.cc/400?u=${encodeURIComponent(a.email)}`,
    about:
      i === 0
        ? "Lecturer in agronomy at UR with ten years of participatory research on seed sovereignty."
        : "IITA scientist working on climate-resilient root and tuber systems across West Africa.",
    title: a.topic,
    summary:
      i === 0
        ? "This session presents community seed banking models that preserve indigenous varieties while meeting food security targets in hillside communities."
        : "We share longitudinal trial data on yam systems under variable rainfall, with farmer co-researcher protocols.",
    presentationType: (i === 0 ? "Workshop" : "Panel") as PresentationType,
    documentName: i === 0 ? "nkurunziza-seed-banking-abstract.pdf" : "adeyemi-yam-climate-abstract.pdf",
    documentDataUrl: i === 0 ? "https://picsum.photos/seed/abstract-ap1/600/800" : undefined,
    status: (a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending") as "pending" | "approved" | "rejected",
    submittedAt: a.submittedAt,
  }));

  const portalSpeaker: SpeakerApplication = {
    id: "sa-portal",
    name: "Dr. Mukeshimana Solange",
    email: "speaker@nas2026.rw",
    phone: "+250 788 200 100",
    country: "Rwanda",
    photoUrl: "https://i.pravatar.cc/400?img=47",
    about:
      "Director General at RAB — leading Rwanda's national agroecology agenda and opening plenary on soil health transitions.",
    title: "Scaling agroecology through national soil health programmes",
    summary:
      "This plenary synthesises five years of hillside soil restoration pilots and outlines policy levers for NAS 2026 delegates.",
    presentationType: "Keynote",
    documentName: "mukeshimana-plenary-abstract.pdf",
    documentDataUrl: "https://picsum.photos/seed/abstract-speaker-main/600/800",
    status: "approved",
    submittedAt: "2026-03-05",
    reviewMessage: "Approved for opening plenary and soil-health panel. Please upload final deck by 29 July.",
  };

  if (fromApps.some((a) => a.email === portalSpeaker.email)) return fromApps;
  return [portalSpeaker, ...fromApps];
}

function seedSpeakerMaterialsData(): {
  sessionMaterials: SessionMaterial[];
  speakerAvRequirements: SpeakerAvRequirements[];
  speakerDecks: SpeakerDeckFile[];
} {
  const email = "speaker@nas2026.rw";
  return {
    sessionMaterials: [
      {
        id: "sm-sp-1",
        sessionId: "ss1",
        fileName: "opening-plenary-delegate-handout.pdf",
        fileDataUrl: "https://picsum.photos/seed/handout-ss1/400/520",
        uploadedBy: "Dr. Mukeshimana Solange",
        uploadedByEmail: email,
        kind: "handout",
        uploadedAt: "2026-07-18",
      },
      {
        id: "sm-sp-2",
        sessionId: "ss1",
        fileName: "kigali-call-to-action-draft-v3.pdf",
        uploadedBy: "Dr. Mukeshimana Solange",
        uploadedByEmail: email,
        kind: "abstract",
        uploadedAt: "2026-07-22",
      },
      {
        id: "sm-sp-3",
        sessionId: "ss2",
        fileName: "soil-health-panel-speaker-notes.pdf",
        fileDataUrl: "https://picsum.photos/seed/handout-ss2/400/520",
        uploadedBy: "Dr. Mukeshimana Solange",
        uploadedByEmail: email,
        kind: "presentation",
        uploadedAt: "2026-07-25",
      },
      {
        id: "sm-sp-4",
        sessionId: "ss2",
        fileName: "rab-soil-metrics-dataset.xlsx",
        uploadedBy: "Dr. Mukeshimana Solange",
        uploadedByEmail: email,
        kind: "handout",
        uploadedAt: "2026-07-26",
      },
    ],
    speakerAvRequirements: [
      {
        speakerEmail: email,
        presentationTool: "venue",
        microphone: "lavalier",
        needsInternet: true,
        includesVideo: false,
        specialEquipment: "HDMI USB-C adapter; backup clicker; test slides 10 min before plenary",
        status: "approved",
        submittedAt: "2026-04-10T09:00:00.000Z",
        updatedAt: "2026-04-15T14:30:00.000Z",
        reviewedAt: "2026-04-16T11:00:00.000Z",
        reviewedBy: "Venue AV Lead",
        venueNotes:
          "Confirmed: wireless clicker + lavalier in Ballroom A. Tech check scheduled 08:45 on Day 1. NAS laptop will load your deck from the portal.",
      },
    ],
    speakerDecks: [
      {
        id: "deck-main",
        speakerEmail: email,
        fileName: "nas2026-soil-health-plenary-v4.pdf",
        fileDataUrl: "https://picsum.photos/seed/deck-speaker-main/800/600",
        uploadedAt: "2026-07-28",
      },
    ],
  };
}

function seedSurveyResponses(): SurveyResponse[] {
  return [
    {
      id: "sv1",
      respondentName: "Alice Uwimana",
      respondentEmail: "alice@example.rw",
      overall: 5,
      content: 5,
      venue: 4,
      networking: 5,
      highlight: "The farmer-led panel and soil health workshop were outstanding — practical and inspiring.",
      improve: "More time for Q&A after plenaries; lunch queues were long on Day 1.",
      recommend: "yes",
      submittedAt: "2026-08-14T17:45:00.000Z",
    },
    {
      id: "sv2",
      respondentName: "John Okello",
      respondentEmail: "j.okello@example.ug",
      overall: 4,
      content: 4,
      venue: 3,
      networking: 4,
      highlight: "Bugesera field visit — seeing integrated practices on the ground.",
      improve: "Better signage between workshop rooms; virtual stream had occasional lag.",
      recommend: "yes",
      submittedAt: "2026-08-14T16:20:00.000Z",
    },
    {
      id: "sv3",
      respondentName: "Sarah Mwangi",
      respondentEmail: "sarah.m@example.ke",
      overall: 4,
      content: 5,
      venue: 4,
      networking: 3,
      highlight: "Science track sessions and the Kigali Call to Action drafting process.",
      improve: "Student mixer could start earlier; more East African delegates in networking directory.",
      recommend: "maybe",
      submittedAt: "2026-08-14T18:10:00.000Z",
    },
    {
      id: "sv4",
      respondentName: "Patrick Niyonzima",
      respondentEmail: "patrick@coop.rw",
      overall: 5,
      content: 4,
      venue: 5,
      networking: 4,
      highlight: "Connecting with cooperatives and MINAGRI officials in one place.",
      improve: "Farmer ticket verification desk was busy — online pre-check would help.",
      recommend: "yes",
      submittedAt: "2026-08-14T15:05:00.000Z",
    },
    {
      id: "sv5",
      respondentName: "Marcus Weber",
      respondentEmail: "weber@giz.de",
      overall: 3,
      content: 4,
      venue: 3,
      networking: 4,
      highlight: "Policy panel on AU framework alignment.",
      improve: "Session recordings not available same-day; translation for French delegates.",
      recommend: "maybe",
      submittedAt: "2026-08-13T11:30:00.000Z",
    },
  ];
}

function seedOrgApplications(): OrganizationApplication[] {
  const agriApp: OrganizationApplication = {
    id: "ex1",
    companyName: "AgriTools Rwanda",
    orgType: "company",
    website: "https://agritools.rw",
    description: "Smallholder-scale tools and irrigation kits — Gold sponsor + exhibitor booth A-12.",
    contactName: "Eric Mukamana",
    contactEmail: "info@agritools.rw",
    contactPhone: "+250 788 300 400",
    participation: "both",
    sponsorshipTier: "Gold",
    staffCount: 4,
    quotedFeeUsd: 8000,
    status: "approved",
    paymentStatus: "paid",
    boothAssignment: "A-12",
    submittedAt: "2026-03-20",
    reviewMessage: "Approved — Gold sponsor + exhibitor. Invoice NAS26-INV-1042 paid; portal active.",
  };

  const fromApps = APPLICATIONS.filter((a) => a.kind === "exhibitor").map((a) => {
    const isGreen = a.id === "ap2";
    return {
      id: a.id,
      companyName: a.org,
      orgType: "company" as OrgType,
      website: "",
      description: a.topic,
      contactName: a.name,
      contactEmail: a.email,
      contactPhone: "",
      participation: isGreen ? ("both" as ParticipationType) : ("exhibitor" as ParticipationType),
      sponsorshipTier: isGreen ? ("Silver" as SponsorshipTier) : undefined,
      staffCount: 2,
      quotedFeeUsd: isGreen ? 3500 : undefined,
      status: (a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending") as "pending" | "approved" | "rejected",
      paymentStatus: "unpaid" as const,
      submittedAt: a.submittedAt,
    };
  });

  return [agriApp, ...fromApps.filter((a) => a.id !== "ex1")];
}

function seedSessionRatings(): SessionRating[] {
  return [
    {
      id: "sr1",
      sessionId: "ss1",
      attendeeEmail: "alice@example.rw",
      attendeeName: "Alice Uwimana",
      stars: 5,
      comment: "Inspiring opening — clear policy direction for agroecology.",
      submittedAt: "2026-08-13T10:00:00.000Z",
    },
    {
      id: "sr2",
      sessionId: "ss1",
      attendeeEmail: "j.okello@example.ug",
      attendeeName: "John Okello",
      stars: 4,
      submittedAt: "2026-08-13T10:15:00.000Z",
    },
    {
      id: "sr3",
      sessionId: "ss2",
      attendeeEmail: "alice@example.rw",
      attendeeName: "Alice Uwimana",
      stars: 5,
      comment: "Excellent soil health data — relevant for our hillside programmes.",
      submittedAt: "2026-08-13T12:00:00.000Z",
    },
    {
      id: "sr4",
      sessionId: "ss3",
      attendeeEmail: "m.bonomi@university.it",
      attendeeName: "Maria Bonomi",
      stars: 4,
      comment: "Panel ran long but content was strong.",
      submittedAt: "2026-08-13T14:30:00.000Z",
    },
  ];
}

function seedSponsorshipInvoices(): SponsorshipInvoice[] {
  const rate = EVENT.exchangeRate;
  return [
    {
      id: "inv-agri-1",
      reference: "NAS26-INV-1042",
      applicationId: "ex1",
      orgId: "ex1",
      orgName: "AgriTools Rwanda",
      contactEmail: "info@agritools.rw",
      tier: "Gold",
      participation: "both",
      amountUsd: 8000,
      amountRwf: Math.round(8000 * rate),
      status: "paid",
      type: "proforma",
      issuedAt: "2026-05-01T09:00:00.000Z",
      dueDate: "2026-05-15",
      paidAt: "2026-05-15T11:30:00.000Z",
      paymentMethod: "Bank transfer",
      issuedBy: "Finance Officer",
      notes: "Gold sponsorship + exhibitor booth package (FR-5.1).",
    },
  ];
}

function seedApprovedOrgs(): ApprovedOrganization[] {
  return EXHIBITORS.map((e, i) => {
    const isPortalOrg = e.id === "ex1";
    const tier = isPortalOrg ? "Gold" : (["Silver", "Platinum", "Silver"] as SponsorshipTier[])[i % 3];
    return {
      id: e.id,
      applicationId: e.id,
      name: e.name,
      participation: isPortalOrg ? ("both" as ParticipationType) : ("exhibitor" as ParticipationType),
      sponsorshipTier: isPortalOrg ? tier : i === 2 ? ("Silver" as SponsorshipTier) : undefined,
      booth: e.booth,
      category: e.category,
      description: e.description,
      contact: e.contact,
      leads: isPortalOrg ? 4 : e.leads || 0,
      profileViews: isPortalOrg ? 142 : 80 + i * 12,
      brochureDownloads: isPortalOrg ? 60 : 20 + i * 5,
      sponsorshipContractRef: isPortalOrg ? "NAS26-SP-AGRI-0042" : undefined,
      sponsorshipPaidThrough: isPortalOrg ? "2026-05-15" : undefined,
      speakingSlot: isPortalOrg ? "Day 1 · Exhibitor showcase (14:30, Hall B)" : undefined,
    };
  });
}

function seedSponsorshipDeliverables(): SponsorshipDeliverable[] {
  return [
    {
      id: "sd1",
      orgId: "ex1",
      title: "Homepage sponsor carousel",
      description: "Logo + 120-character blurb in rotating hero carousel on nas2026.rw",
      channel: "homepage",
      status: "live",
      dueDate: "2026-06-01",
      submittedAt: "2026-05-28",
      liveAt: "2026-06-05",
      secretariatNote: "Live since 5 June — position 2 of 6 in Gold tier rotation.",
    },
    {
      id: "sd2",
      orgId: "ex1",
      title: "Delegate app sponsor banner",
      description: "Banner in attendee dashboard and mobile web check-in",
      channel: "app",
      status: "approved",
      dueDate: "2026-07-01",
      submittedAt: "2026-06-20",
      secretariatNote: "Approved — goes live when app v1.2 ships on 1 August.",
    },
    {
      id: "sd3",
      orgId: "ex1",
      title: "Printed programme — inside cover",
      description: "Full-colour logo on inside front cover of delegate handbook (5,000 print run)",
      channel: "programme",
      status: "in_review",
      dueDate: "2026-07-10",
      submittedAt: "2026-07-02",
      secretariatNote: "Print vendor checking CMYK — expect proof by 12 July.",
    },
    {
      id: "sd4",
      orgId: "ex1",
      title: "August newsletter feature",
      description: "150-word partner spotlight + logo in NAS August delegate newsletter",
      channel: "newsletter",
      status: "approved",
      dueDate: "2026-07-20",
      submittedAt: "2026-06-15",
      secretariatNote: "Copy approved. Sends 28 July to 4,200 subscribers.",
    },
    {
      id: "sd5",
      orgId: "ex1",
      title: "Opening plenary slide",
      description: "Logo on thank-you slide during opening plenary (20 seconds)",
      channel: "opening",
      status: "pending",
      dueDate: "2026-07-29",
      secretariatNote: "Upload 16:9 PNG via Booth profile or reply to sponsorship@nas2026.rw",
    },
    {
      id: "sd6",
      orgId: "ex1",
      title: "Exhibitor hall wayfinding signage",
      description: "Booth A-12 directional signs at Marriott foyer and hall entrance",
      channel: "signage",
      status: "live",
      dueDate: "2026-08-01",
      submittedAt: "2026-07-25",
      liveAt: "2026-08-10",
      secretariatNote: "Installed during setup window 12 August.",
    },
  ];
}

function seedSponsorshipTiers(): SponsorshipTierConfig[] {
  return [
    {
      tier: "Platinum",
      benefits: ["10 staff passes", "5 brochure slots", "Lead capture", "Speaking slot", "Homepage feature"],
      staffPasses: 10,
      brochureSlots: 5,
      leadCapture: true,
      speakingSlot: true,
      homepageFeature: true,
      newsletterMention: false,
      boothListing: false,
      baseFeeUsd: 15000,
      extraStaffFeeUsd: 350,
    },
    {
      tier: "Gold",
      benefits: ["4 staff passes", "3 brochure slots", "Lead capture", "Newsletter mention"],
      staffPasses: 4,
      brochureSlots: 3,
      leadCapture: true,
      speakingSlot: false,
      homepageFeature: false,
      newsletterMention: true,
      boothListing: false,
      baseFeeUsd: 8000,
      extraStaffFeeUsd: 400,
    },
    {
      tier: "Silver",
      benefits: ["2 staff passes", "1 brochure slot", "Booth listing"],
      staffPasses: 2,
      brochureSlots: 1,
      leadCapture: false,
      speakingSlot: false,
      homepageFeature: false,
      newsletterMention: false,
      boothListing: true,
      baseFeeUsd: 3500,
      extraStaffFeeUsd: 450,
    },
  ];
}

function seedExhibitorBoothPackage(): ExhibitorBoothPackage {
  return {
    baseFeeUsd: 2200,
    includedStaff: 2,
    extraStaffFeeUsd: 500,
    description: "Standard booth — 2 complimentary staff check-ins included. Invited staff do not pay individually.",
  };
}

function seedPlatformSettings(): PlatformSettings {
  return {
    eventName: EVENT.name,
    shortName: EVENT.shortName,
    theme: EVENT.theme,
    startDate: "2026-08-13",
    endDate: "2026-08-14",
    venue: EVENT.venue,
    organizer: EVENT.organizer,
    exchangeRate: EVENT.exchangeRate,
    timezone: "Africa/Kigali (CAT)",
    platformUrl: "nas2026.rw",
    countries: [
      "Rwanda", "Kenya", "Uganda", "Tanzania", "Ethiopia", "Burundi", "DRC",
      "Ghana", "Nigeria", "Senegal", "South Africa", "France", "Germany", "United States", "United Kingdom",
    ],
    features: {
      registration: true,
      payments: true,
      ticketPlans: true,
      abstracts: true,
      speakerPortal: true,
      exhibitorPortal: true,
      programmePublished: true,
      liveStream: true,
      remoteQueue: true,
      checkIn: true,
      networking: true,
      certificates: true,
      survey: true,
      resourceRepository: false,
      maintenanceMode: false,
    },
    cancellationPolicyText:
      "Cancellations received more than 30 days before NAS 2026 (before 14 July 2026) qualify for a full refund minus a 5% processing fee. Between 14–31 July, 50% refund. No refund after 31 July except documented emergencies (medical, visa denial) reviewed by the secretariat. Registration transfers to another named delegate require admin approval and are free of charge. Refunds are processed manually within 14 business days to the original payment method.",
    refundProcessingDays: 14,
    groupRegistration: { ...DEFAULT_GROUP_REGISTRATION_SETTINGS },
  };
}

/** Array fields on AppStore — backfilled from seed when missing in localStorage. */
const STORE_ARRAY_KEYS = [
  "users",
  "invites",
  "auditLog",
  "ticketPlans",
  "registrations",
  "groupRegistrations",
  "documentVerifications",
  "speakerApplications",
  "mediaApplications",
  "organizationApplications",
  "approvedOrganizations",
  "sponsorshipTiers",
  "sponsorshipDeliverables",
  "sessionRatings",
  "sponsorshipInvoices",
  "runOfShow",
  "zoomMeetings",
  "remoteInteractions",
  "recordings",
  "exhibitorLeads",
  "exhibitorStaff",
  "checkInScans",
  "speakerAbstracts",
  "sessions",
  "sessionMaterials",
  "speakerAvRequirements",
  "speakerDecks",
  "surveyResponses",
  "announcements",
  "announcementDismissals",
  "newsPosts",
  "committeeMembers",
  "galleryImages",
  "previousPresentations",
  "rooms",
  "booths",
  "speakerProfiles",
  "cancellationRequests",
  "waitlist",
  "attendeeProfiles",
  "connectionRequests",
  "chatMessages",
  "livePolls",
  "pollVotes",
] as const satisfies readonly (keyof AppStore)[];

function storeNeedsRepair(store: AppStore): boolean {
  if (!store.platformSettings?.groupRegistration) return true;
  if (!store.exhibitorBoothPackage || !store.certificateTemplate || !store.platformSettings) return true;
  return STORE_ARRAY_KEYS.some((key) => store[key] == null);
}

function migrateStore(store: AppStore): AppStore {
  let next = repairStore({ ...store, version: STORE_VERSION });
  if (next.previousPresentations?.length) {
    next.previousPresentations = next.previousPresentations.map((p, i) => ({
      ...p,
      event: p.event ?? "2nd National Agroecology Symposium",
      year: p.year ?? 2024,
      kind: p.kind ?? ("slides" as SymposiumArchiveKind),
      order: p.order ?? i + 1,
    }));
  }
  return next;
}

function repairStore(store: AppStore): AppStore {
  if (!storeNeedsRepair(store)) return store;

  const seed = createSeed();
  const repaired = { ...store, version: STORE_VERSION } as AppStore;

  for (const key of STORE_ARRAY_KEYS) {
    if (repaired[key] == null) {
      Object.assign(repaired, { [key]: seed[key] });
    }
  }

  repaired.exhibitorBoothPackage = store.exhibitorBoothPackage ?? seed.exhibitorBoothPackage;
  repaired.certificateTemplate = store.certificateTemplate ?? seed.certificateTemplate;
  repaired.platformSettings = {
    ...seed.platformSettings,
    ...store.platformSettings,
    features: {
      ...seed.platformSettings.features,
      ...store.platformSettings?.features,
    },
    countries: store.platformSettings?.countries ?? seed.platformSettings.countries,
    groupRegistration: {
      ...DEFAULT_GROUP_REGISTRATION_SETTINGS,
      ...store.platformSettings?.groupRegistration,
    },
  };

  return repaired;
}

function seedGroupRegistrations(baseRegs: StoreRegistration[]): {
  groups: GroupRegistration[];
  registrations: StoreRegistration[];
} {
  const john = baseRegs.find((r) => r.email === "j.okello@example.ug");
  if (!john) return { groups: [], registrations: baseRegs };

  const groupId = "grp-demo";
  const planUsd = john.amountUsd || 150;
  const memberCount = 5;
  const pricing = {
    subtotalUsd: planUsd * memberCount,
    discountPercent: 10,
    discountUsd: planUsd * memberCount * 0.1,
    totalUsd: planUsd * memberCount * 0.9,
  };

  const extraMembers: StoreRegistration[] = [
    {
      id: "r-grp-2",
      name: "Claude Nshimiyimana",
      email: "claude.nshimiyimana@minagri.gov.rw",
      country: "Rwanda",
      category: john.category,
      categoryId: john.categoryId,
      amountUsd: pricing.totalUsd / memberCount,
      status: "paid",
      verificationStatus: "none",
      createdAt: "2026-04-10",
      checkedIn: true,
      checkedInAt: "2026-08-13T08:15:00.000Z",
      groupId,
      groupRole: "member",
      details: {
        ticketId: "NAS26-GRP-2002",
        title: "Programme Officer",
        org: "MINAGRI Rwanda",
        phone: "+250 788 111 222",
        hear: "Group registration",
        paymentMethod: "bank",
        roleNote: "group-member",
      },
    },
    { 
      id: "r-grp-3",
      name: "Grace Mukamana",
      email: "grace.mukamana@coop.rw",
      country: "Rwanda",
      category: john.category,
      categoryId: john.categoryId,
      amountUsd: pricing.totalUsd / memberCount,
      status: "paid",
      verificationStatus: "none",
      createdAt: "2026-04-10",
      checkedIn: false,
      groupId,
      groupRole: "member",
      details: {
        ticketId: "NAS26-GRP-2003",
        title: "Field Officer",
        org: "Imbaraga Farmers Federation",
        hear: "Group registration",
        paymentMethod: "bank",
        roleNote: "group-member",
      },
    },
    {
      id: "r-grp-4",
      name: "Patrick Habimana",
      email: "patrick.h@coop.rw",
      country: "Rwanda",
      category: john.category,
      categoryId: john.categoryId,
      amountUsd: pricing.totalUsd / memberCount,
      status: "paid",
      verificationStatus: "none",
      createdAt: "2026-04-10",
      checkedIn: false,
      groupId,
      groupRole: "member",
      details: {
        ticketId: "NAS26-GRP-2004",
        title: "Cooperative Lead",
        org: "Imbaraga Farmers Federation",
        hear: "Group registration",
        paymentMethod: "bank",
        roleNote: "group-member",
      },
    },
    {
      id: "r-grp-5",
      name: "Eric Niyonsenga",
      email: "eric.n@coop.rw",
      country: "Rwanda",
      category: john.category,
      categoryId: john.categoryId,
      amountUsd: pricing.totalUsd / memberCount,
      status: "paid",
      verificationStatus: "none",
      createdAt: "2026-04-10",
      checkedIn: false,
      groupId,
      groupRole: "member",
      details: {
        ticketId: "NAS26-GRP-2005",
        title: "Youth Delegate",
        org: "Imbaraga Farmers Federation",
        hear: "Group registration",
        paymentMethod: "bank",
        roleNote: "group-member",
      },
    },
  ];

  const johnPatched: StoreRegistration = {
    ...john,
    groupId,
    groupRole: "representative",
    amountUsd: pricing.totalUsd / memberCount,
    details: {
      ...john.details!,
      roleNote: "group-representative",
    },
  };

  const allIds = [johnPatched.id, ...extraMembers.map((m) => m.id)];
  const group: GroupRegistration = {
    id: groupId,
    code: "GRP-DEMO01",
    orgName: "Imbaraga Farmers Federation",
    representativeRegistrationId: john.id,
    representativeEmail: john.email,
    representativeName: john.name,
    country: john.country,
    categoryId: john.categoryId,
    categoryName: john.category,
    memberCount,
    memberRegistrationIds: allIds,
    pricePerSeatUsd: planUsd,
    subtotalUsd: pricing.subtotalUsd,
    discountPercent: pricing.discountPercent,
    discountUsd: pricing.discountUsd,
    totalUsd: pricing.totalUsd,
    status: "paid",
    paymentMethod: "bank",
    createdAt: "2026-04-10",
  };

  const registrations = baseRegs.map((r) => (r.id === john.id ? johnPatched : r));
  return { groups: [group], registrations: [...extraMembers, ...registrations] };
}

const DEFAULT_PLAN_CAPACITY: Record<string, number> = {
  intl: 200,
  ngo: 150,
  academic: 120,
  student: 1,
  farmer: 60,
  virtual: 500,
  media: 60,
};

function seedMediaApplications(regs: StoreRegistration[]): MediaApplication[] {
  const pendingReg = regs.find((r) => r.categoryId === "media" && r.status === "pending");
  return [
    {
      id: "ma-demo-pending",
      registrationId: pendingReg?.id ?? "r-media-pending",
      name: "Claudine Uwase",
      email: "c.uwase@kigalitoday.rw",
      phone: "+250 788 555 010",
      country: "Rwanda",
      jobTitle: "Senior Reporter",
      pressName: "Kigali Today",
      pressType: "digital",
      pressWebsite: "https://kigalitoday.rw",
      pressCountry: "Rwanda",
      editorName: "Jean-Paul Habimana",
      editorEmail: "editor@kigalitoday.rw",
      coverageBrief: "Daily coverage of plenary sessions and farmer innovation zone for online readers.",
      socialHandle: "@kigalitoday",
      credentialFileName: "press-card-claudine.pdf",
      letterFileName: "assignment-letter-kigalitoday.pdf",
      status: "pending",
      submittedAt: "2026-05-18",
    },
    {
      id: "ma-demo-approved",
      registrationId: "r-media-approved",
      name: "Sarah Mensah",
      email: "s.mensah@africanews.com",
      phone: "+233 24 000 1234",
      country: "Ghana",
      jobTitle: "Correspondent",
      pressName: "Africa News Network",
      pressType: "tv",
      pressWebsite: "https://africanews.com",
      pressCountry: "Ghana",
      coverageBrief: "Broadcast features on agroecology policy and East Africa pavilion.",
      credentialFileName: "press-id-sarah.pdf",
      letterFileName: "outlet-letter-africanews.pdf",
      status: "approved",
      reviewedBy: "Registration Desk",
      reviewedAt: "2026-05-20T10:00:00.000Z",
      submittedAt: "2026-05-12",
    },
  ];
}

const ADMIN_NETWORKING_EMAIL = "admin@nas2026.rw";

function seedAttendeeProfiles(regs: StoreRegistration[]): AttendeeProfile[] {
  const fromRegs = regs.map((r, i) => ({
    email: r.email,
    name: r.name,
    title: r.details?.title,
    org: r.details?.org ?? "",
    country: r.country,
    photo: `https://i.pravatar.cc/400?u=${encodeURIComponent(r.email)}`,
    bio:
      i === 0
        ? "Programme officer focused on agroecology scaling in Rwanda."
        : i === 1
          ? "Cooperative director working on inclusive market access in East Africa."
          : i === 3
            ? "Farmer cooperative founder — passionate about soil health and local seed systems."
            : undefined,
    interests: r.details?.interests ?? ["Soil Health"],
    subThemeInterests: (r.details?.interests?.filter((x): x is SubTheme =>
      ["Soil Health", "Food Systems", "Policy & Governance", "Climate Resilience", "Farmer Innovation"].includes(x as SubTheme),
    ) ?? ["Food Systems"]) as SubTheme[],
    publicInDirectory: i !== 5,
    allowMessages: true,
    allowExhibitorContact: r.email !== "weber@giz.de",
  }));

  const extra: AttendeeProfile[] = [
    {
      email: ADMIN_NETWORKING_EMAIL,
      name: "Symposium Admin",
      title: "Secretariat Lead",
      org: "NAS 2026 Organizing Committee",
      country: "Rwanda",
      photo: "https://i.pravatar.cc/400?u=admin-nas2026",
      bio: "Conference operations — happy to connect delegates with programme leads and logistics.",
      interests: ["Policy & Governance", "Food Systems"],
      subThemeInterests: ["Policy & Governance", "Food Systems"],
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: true,
    },
    {
      email: "amara@snv.org",
      name: "Dr. Amara Diallo",
      title: "Country Director",
      org: "SNV Netherlands Development Org.",
      country: "Senegal",
      photo: "https://i.pravatar.cc/400?img=48",
      bio: "Driving inclusive agribusiness across the Sahel with two decades in agricultural development.",
      interests: ["Food Systems"],
      subThemeInterests: ["Food Systems", "Policy & Governance"],
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: true,
    },
    {
      email: "chiamaka@cgiar.org",
      name: "Dr. Chiamaka Okonkwo",
      title: "Senior Economist",
      org: "CGIAR Initiative on Agroecology",
      country: "Nigeria",
      photo: "https://i.pravatar.cc/400?img=21",
      bio: "Quantifying socio-economic returns of agroecological transitions in East Africa.",
      interests: ["Policy & Governance"],
      subThemeInterests: ["Policy & Governance", "Climate Resilience"],
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: true,
    },
    {
      email: "esther@uon.ac.ke",
      name: "Prof. Esther Wanjiru",
      title: "Professor of Soil Science",
      org: "University of Nairobi",
      country: "Kenya",
      photo: "https://i.pravatar.cc/400?img=45",
      bio: "Pioneering research on regenerative soil practices across East Africa's smallholder systems.",
      interests: ["Soil Health"],
      subThemeInterests: ["Soil Health", "Climate Resilience"],
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: true,
    },
  ];

  const seen = new Set(fromRegs.map((p) => p.email));
  return [...fromRegs, ...extra.filter((p) => !seen.has(p.email))];
}

function seedConnectionRequests(): StoreConnectionRequest[] {
  const admin = ADMIN_NETWORKING_EMAIL;
  const adminName = "Symposium Admin";
  return [
    // —— Alice (attendee demo) ——
    {
      id: "cr-a1",
      fromEmail: "amara@snv.org",
      fromName: "Dr. Amara Diallo",
      toEmail: "alice@example.rw",
      toName: "Alice Uwimana",
      message: "Hi Alice — I'd love to compare notes on inclusive market models. Coffee on Day 1?",
      status: "pending",
      createdAt: "2026-08-01",
    },
    {
      id: "cr-a2",
      fromEmail: "chiamaka@cgiar.org",
      fromName: "Dr. Chiamaka Okonkwo",
      toEmail: "alice@example.rw",
      toName: "Alice Uwimana",
      message: "We have overlap on M&E frameworks — happy to share before the symposium.",
      status: "pending",
      createdAt: "2026-07-29",
    },
    {
      id: "cr-a3",
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      toEmail: "alice@example.rw",
      toName: "Alice Uwimana",
      message: "Looking forward to your soil-health perspective in the workshop.",
      status: "accepted",
      createdAt: "2026-07-25",
    },
    {
      id: "cr-a4",
      fromEmail: "weber@giz.de",
      fromName: "Marcus Weber",
      toEmail: "alice@example.rw",
      toName: "Alice Uwimana",
      message: "GIZ would love a brief 1:1 on programme alignment.",
      status: "declined",
      createdAt: "2026-07-20",
    },
    {
      id: "cr-a5",
      fromEmail: "alice@example.rw",
      fromName: "Alice Uwimana",
      toEmail: "patrick@coop.rw",
      toName: "Patrick Niyonzima",
      message: "Patrick — would be great to visit your cooperative stand together.",
      status: "pending",
      createdAt: "2026-07-28",
    },
    // —— Admin (organizer networking) ——
    {
      id: "cr-ad1",
      fromEmail: "amara@snv.org",
      fromName: "Dr. Amara Diallo",
      toEmail: admin,
      toName: adminName,
      message: "Hello — SNV would like to coordinate a side session on inclusive value chains. Could we connect?",
      status: "pending",
      createdAt: "2026-08-02",
    },
    {
      id: "cr-ad2",
      fromEmail: "chiamaka@cgiar.org",
      fromName: "Dr. Chiamaka Okonkwo",
      toEmail: admin,
      toName: adminName,
      message: "CGIAR team arriving Monday — need booth walk-through and speaker green-room timing.",
      status: "pending",
      createdAt: "2026-08-01",
    },
    {
      id: "cr-ad3",
      fromEmail: "j.okello@example.ug",
      fromName: "John Okello",
      toEmail: admin,
      toName: adminName,
      message: "Our farmer cooperative delegation (12) — confirming group check-in window on Day 1?",
      status: "pending",
      createdAt: "2026-07-30",
    },
    {
      id: "cr-ad4",
      fromEmail: "m.bonomi@university.it",
      fromName: "Maria Bonomi",
      toEmail: admin,
      toName: adminName,
      message: "Academic poster session — requesting power outlets for 8 boards in Room B.",
      status: "pending",
      createdAt: "2026-07-27",
    },
    {
      id: "cr-ad5",
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      toEmail: admin,
      toName: adminName,
      message: "Confirmed for soil-health workshop — sharing final slides by Friday.",
      status: "accepted",
      createdAt: "2026-07-22",
    },
    {
      id: "cr-ad6",
      fromEmail: "alice@example.rw",
      fromName: "Alice Uwimana",
      toEmail: admin,
      toName: adminName,
      message: "MINAGRI liaison — happy to help with ministerial escort on opening day.",
      status: "accepted",
      createdAt: "2026-07-18",
    },
    {
      id: "cr-ad7",
      fromEmail: admin,
      fromName: adminName,
      toEmail: "j.okello@example.ug",
      toName: "John Okello",
      message: "Thanks John — group check-in is 07:30–08:30 at the Marriott foyer. I'll send the QR pack.",
      status: "accepted",
      createdAt: "2026-07-19",
    },
    {
      id: "cr-ad8",
      fromEmail: admin,
      fromName: adminName,
      toEmail: "patrick@coop.rw",
      toName: "Patrick Niyonzima",
      message: "Patrick — inviting you to the farmer innovation roundtable on Day 2.",
      status: "pending",
      createdAt: "2026-08-03",
    },
    {
      id: "cr-ad9",
      fromEmail: admin,
      fromName: adminName,
      toEmail: "weber@giz.de",
      toName: "Marcus Weber",
      message: "Following up on GIZ sponsorship deliverables for the closing plenary.",
      status: "declined",
      createdAt: "2026-07-15",
    },
    {
      id: "cr-ad10",
      fromEmail: admin,
      fromName: adminName,
      toEmail: "aisha@example.sn",
      toName: "Aisha Diop",
      message: "Welcome to NAS 2026 — let me know if you need visa-support letters reissued.",
      status: "accepted",
      createdAt: "2026-07-12",
    },
  ];
}

function seedChatMessages(): ChatMessage[] {
  const t = (a: string, b: string) => getThreadId(a, b);
  const admin = ADMIN_NETWORKING_EMAIL;

  return [
    // Alice ↔ Esther
    {
      id: "msg-a1",
      threadId: t("alice@example.rw", "esther@uon.ac.ke"),
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      body: "Alice — great to connect! Will you be at the soil workshop on Day 1?",
      sentAt: "2026-08-12T09:15:00.000Z",
    },
    {
      id: "msg-a2",
      threadId: t("alice@example.rw", "esther@uon.ac.ke"),
      fromEmail: "alice@example.rw",
      fromName: "Alice Uwimana",
      body: "Yes, I'll be there. Let's grab coffee after the plenary.",
      sentAt: "2026-08-12T09:42:00.000Z",
    },
    {
      id: "msg-a3",
      threadId: t("alice@example.rw", "esther@uon.ac.ke"),
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      body: "Perfect — Garden Terrace at 11:00 works for me.",
      sentAt: "2026-08-12T09:48:00.000Z",
    },
    // Admin ↔ Esther
    {
      id: "msg-ad1",
      threadId: t(admin, "esther@uon.ac.ke"),
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      body: "Good morning — I've uploaded the final deck to the speaker portal. AV needs HDMI + clicker backup.",
      sentAt: "2026-08-13T07:05:00.000Z",
    },
    {
      id: "msg-ad2",
      threadId: t(admin, "esther@uon.ac.ke"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Received, thank you. Green room opens 30 min before your session in Kigali Ballroom B.",
      sentAt: "2026-08-13T07:18:00.000Z",
    },
    {
      id: "msg-ad3",
      threadId: t(admin, "esther@uon.ac.ke"),
      fromEmail: "esther@uon.ac.ke",
      fromName: "Prof. Esther Wanjiru",
      body: "Noted. I'll do a tech check at 08:45.",
      sentAt: "2026-08-13T07:22:00.000Z",
    },
    {
      id: "msg-ad4",
      threadId: t(admin, "esther@uon.ac.ke"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Moderator Claire will introduce you — bio slide is in the run-of-show.",
      sentAt: "2026-08-13T07:30:00.000Z",
    },
    // Admin ↔ Alice
    {
      id: "msg-ad5",
      threadId: t(admin, "alice@example.rw"),
      fromEmail: "alice@example.rw",
      fromName: "Alice Uwimana",
      body: "Confirming ministerial escort route — delegation arrives 08:15 at main entrance.",
      sentAt: "2026-08-13T06:50:00.000Z",
    },
    {
      id: "msg-ad6",
      threadId: t(admin, "alice@example.rw"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Thanks Alice. Security and protocol teams are briefed. Badge pickup is at Desk A.",
      sentAt: "2026-08-13T07:02:00.000Z",
    },
    {
      id: "msg-ad7",
      threadId: t(admin, "alice@example.rw"),
      fromEmail: "alice@example.rw",
      fromName: "Alice Uwimana",
      body: "I'll meet them there. Lunch for VIP table is vegetarian-forward as requested.",
      sentAt: "2026-08-13T07:10:00.000Z",
    },
    // Admin ↔ John
    {
      id: "msg-ad8",
      threadId: t(admin, "j.okello@example.ug"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Hi John — your group QR codes are ready. Forwarding the PDF to your email now.",
      sentAt: "2026-08-12T14:00:00.000Z",
    },
    {
      id: "msg-ad9",
      threadId: t(admin, "j.okello@example.ug"),
      fromEmail: "j.okello@example.ug",
      fromName: "John Okello",
      body: "Received — we'll arrive 07:45. Any parking for the cooperative bus?",
      sentAt: "2026-08-12T14:22:00.000Z",
    },
    {
      id: "msg-ad10",
      threadId: t(admin, "j.okello@example.ug"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Use the Marriott underground lot — validation vouchers at registration desk.",
      sentAt: "2026-08-12T14:35:00.000Z",
    },
    {
      id: "msg-ad11",
      threadId: t(admin, "j.okello@example.ug"),
      fromEmail: "j.okello@example.ug",
      fromName: "John Okello",
      body: "Perfect. See you Day 1 — we're excited for the field visit.",
      sentAt: "2026-08-12T15:01:00.000Z",
    },
    // Admin ↔ Aisha
    {
      id: "msg-ad12",
      threadId: t(admin, "aisha@example.sn"),
      fromEmail: "aisha@example.sn",
      fromName: "Aisha Diop",
      body: "Bonjour — visa letter received, merci. Which session covers school-feeding linkages?",
      sentAt: "2026-08-11T11:20:00.000Z",
    },
    {
      id: "msg-ad13",
      threadId: t(admin, "aisha@example.sn"),
      fromEmail: admin,
      fromName: "Symposium Admin",
      body: "Day 1, 14:00 — Food Systems plenary in Ballroom A. I've added it to your programme bookmark.",
      sentAt: "2026-08-11T11:45:00.000Z",
    },
    {
      id: "msg-ad14",
      threadId: t(admin, "aisha@example.sn"),
      fromEmail: "aisha@example.sn",
      fromName: "Aisha Diop",
      body: "Excellent. I'll connect with WFP colleagues at the exhibitor hall after.",
      sentAt: "2026-08-11T12:02:00.000Z",
    },
  ];
}

function seedWaitlist(): WaitlistEntry[] {
  return [
    {
      id: "wl1",
      email: "waitlist.student@example.rw",
      name: "Claude Nshimiyimana",
      categoryId: "student",
      categoryName: "Student",
      country: "Rwanda",
      org: "University of Rwanda",
      joinedAt: "2026-05-10",
      notified: false,
    },
  ];
}

function seedCertificateTemplate(): CertificateTemplate {
  return {
    headline: "Certificate of Attendance",
    subheadline: EVENT.name,
    bodyLine: "This certifies that the bearer attended NAS 2026 as a registered delegate.",
    footerLine: "13–14 August 2026 · Kigali, Rwanda",
    signatures: [
      { name: "Hon. Geraldine Mukeshimana", title: "Minister of Agriculture, MINAGRI" },
      { name: "Dr. Mukeshimana Solange", title: "Director General, RAB" },
    ],
    style: { primaryColor: "#0f3d2e", accentColor: "#c9a227", showQr: true },
    previewName: "Jean Uwimana",
    previewCategory: "International Delegate",
    previewTicketId: "NAS26-DEMO-4821",
  };
}

function seedCommittee(): CommitteeMember[] {
  return [
    { id: "cm1", name: "Dr. Mukeshimana Solange", role: "Chair", org: "Rwanda Agriculture Board", photo: "https://i.pravatar.cc/400?img=47", bio: "Leads national agroecology policy alignment with MINAGRI.", order: 1 },
    { id: "cm2", name: "Jean-Baptiste Habimana", role: "Co-Chair", org: "Imbaraga Farmers Federation", photo: "https://i.pravatar.cc/400?img=12", bio: "Farmer liaison ensuring grassroots voices shape the programme.", order: 2 },
    { id: "cm3", name: "Lisa Ndayishimiye", role: "Secretariat Lead", org: "GIZ Rwanda", photo: "https://i.pravatar.cc/400?img=49", bio: "Coordinates logistics, partnerships, and delegate communications.", order: 3 },
    { id: "cm4", name: "Dr. Kwame Asante", role: "Programme Committee", org: "Alliance Bioversity & CIAT", photo: "https://i.pravatar.cc/400?img=11", bio: "Curates scientific tracks and abstract review.", order: 4 },
    { id: "cm5", name: "Prof. Esther Wanjiru", role: "Science Track", org: "University of Nairobi", photo: "https://i.pravatar.cc/400?img=45", bio: "East Africa research partnerships and youth science strand.", order: 5 },
    { id: "cm6", name: "Theogene Rutagwenda", role: "Partnerships", org: "WFP Rwanda", photo: "https://i.pravatar.cc/400?img=14", bio: "Sponsor relations and exhibitor onboarding.", order: 6 },
  ];
}

function seedGalleryImages(): GalleryImage[] {
  const captions = [
    "Opening plenary — 2nd NAS, Kigali 2024",
    "Farmer innovation showcase",
    "Panel: scaling agroecology in East Africa",
    "Exhibition hall networking",
    "Youth delegates workshop",
    "Field visit — Bugesera demonstration farm",
    "Closing ceremony — roadmap adoption",
    "Ministerial roundtable",
    "Exhibitor booth demonstrations",
    "Delegate networking reception",
  ];
  return captions.map((caption, i) => ({
    id: `gal-${i + 1}`,
    src: `https://picsum.photos/seed/nas2-gallery-${i + 1}/800/600`,
    caption,
    event: "2nd National Agroecology Symposium",
    year: 2024,
    order: i + 1,
  }));
}

function seedPreviousPresentations(): PreviousPresentation[] {
  const event = "2nd National Agroecology Symposium";
  const year = 2024;
  return [
    {
      id: "pres-1",
      title: "National agroecology roadmap — progress report",
      presenter: "Dr. Mukeshimana Solange",
      fileName: "NAS2024-roadmap-progress.pdf",
      fileUrl: "#",
      event,
      year,
      kind: "slides",
      order: 1,
    },
    {
      id: "pres-2",
      title: "Farmer-led soil health monitoring in hillside systems",
      presenter: "Jean-Baptiste Habimana",
      fileName: "NAS2024-soil-health-farmers.pdf",
      fileUrl: "#",
      event,
      year,
      kind: "slides",
      order: 2,
    },
    {
      id: "pres-3",
      title: "Youth entrepreneurship in agroecological value chains",
      presenter: "Youth in Agribusiness Forum",
      fileName: "NAS2024-youth-value-chains.pdf",
      fileUrl: "#",
      event,
      year,
      kind: "slides",
      order: 3,
    },
    {
      id: "pres-4",
      title: "Policy enablers for organic certification at scale",
      presenter: "MINAGRI Policy Unit",
      fileName: "NAS2024-organic-certification.pdf",
      fileUrl: "#",
      event,
      year,
      kind: "slides",
      order: 4,
    },
    {
      id: "pres-5",
      title: "2nd NAS — symposium overview & outcomes",
      presenter: "NAS Secretariat",
      fileName: "NAS2024-overview.pdf",
      fileUrl: "#",
      event,
      year,
      kind: "overview",
      order: 5,
    },
  ];
}

function seedRooms(): VenueRoom[] {
  return ROOMS.map((r) => ({ id: r.id, name: r.name, capacity: r.capacity, floor: r.floor, av: r.av }));
}

function seedBooths(): Booth[] {
  const booths: Booth[] = [];
  const rows = ["A", "B", "C", "D"];
  let n = 1;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const code = `${rows[r]}-${String(n).padStart(2, "0")}`;
      const assigned = EXHIBITORS.find((e) => e.booth === code);
      booths.push({
        id: `booth-${code}`,
        code,
        row: r,
        col: c,
        capacity: 4,
        location: `Main exhibition hall · Row ${rows[r]} · Bay ${c + 1}`,
        assignedOrgId: assigned?.id,
        status: assigned ? "occupied" : "available",
        dimensions: "3m × 3m",
        floor: "Ground floor",
        includes: [
          "1× rectangular display table (180×60cm)",
          "2× chairs",
          "2× 220V power outlets",
          "Dedicated 50 Mbps wifi",
          "Booth signage with your logo",
          "Daily cleaning service",
        ],
        setupWindow: "12 Aug · 14:00–18:00",
        breakdownWindow: "14 Aug · 18:00–20:00",
        onSiteContact: "Thierry Niyonsenga · +250 788 000 000",
      });
      n++;
    }
  }
  return booths;
}

function seedSpeakerProfiles(): SpeakerProfile[] {
  return SPEAKERS.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    org: s.org,
    country: s.country,
    flag: s.flag,
    bio: s.bio,
    photo: s.photo,
    sessions: s.sessions,
    email: s.id === "s1" ? "speaker@nas2026.rw" : undefined,
  }));
}

export function calculateOrgPackageFee(
  participation: ParticipationType,
  tier: SponsorshipTier | undefined,
  staffCount: number,
  store: AppStore,
): { feeUsd: number; includedStaff: number; extraStaff: number } {
  const staff = Math.max(1, staffCount);
  if (participation === "exhibitor") {
    const pkg = store.exhibitorBoothPackage;
    const extra = Math.max(0, staff - pkg.includedStaff);
    return { feeUsd: pkg.baseFeeUsd + extra * pkg.extraStaffFeeUsd, includedStaff: pkg.includedStaff, extraStaff: extra };
  }
  const tierCfg = store.sponsorshipTiers.find((t) => t.tier === tier) ?? store.sponsorshipTiers[1];
  const extra = Math.max(0, staff - tierCfg.staffPasses);
  return {
    feeUsd: tierCfg.baseFeeUsd + extra * tierCfg.extraStaffFeeUsd,
    includedStaff: tierCfg.staffPasses,
    extraStaff: extra,
  };
}

function seedCancellationRequests(registrations: StoreRegistration[]): CancellationRequest[] {
  const alice = registrations.find((r) => r.email === "alice@example.rw");
  const john = registrations.find((r) => r.email === "j.okello@example.ug");
  const items: CancellationRequest[] = [];

  if (alice) {
    items.push(
      {
        id: "cx-alice-1",
        registrationId: alice.id,
        requesterEmail: alice.email,
        requesterName: alice.name,
        type: "transfer",
        reason:
          "I can no longer attend due to a ministry assignment abroad. I would like to transfer my pass to a colleague at MINAGRI who will represent our programme.",
        status: "approved",
        transferToName: "Claude Nshimiyimana",
        transferToEmail: "claude.nshimiyimana@minagri.gov.rw",
        adminNotes:
          "Transfer approved. Claude will receive a new confirmation email and QR pass within 2 business days. No additional fee.",
        processedBy: "Finance Officer",
        processedAt: "2026-06-18T09:15:00.000Z",
        createdAt: "2026-06-10T11:20:00.000Z",
      },
      {
        id: "cx-alice-2",
        registrationId: alice.id,
        requesterEmail: alice.email,
        requesterName: alice.name,
        type: "refund",
        reason: "Initial refund request — conference dates conflicted with another UN mission (withdrawn after transfer was arranged).",
        status: "rejected",
        refundAmountUsd: 237.5,
        adminNotes:
          "Superseded by approved transfer request cx-alice-1. No refund required.",
        processedBy: "Symposium Admin",
        processedAt: "2026-06-12T08:00:00.000Z",
        createdAt: "2026-06-08T16:45:00.000Z",
      },
      {
        id: "cx-alice-3",
        registrationId: alice.id,
        requesterEmail: alice.email,
        requesterName: alice.name,
        type: "refund",
        reason:
          "Family medical emergency — unable to travel to Kigali. Requesting full refund per policy exception (documentation attached in email to secretariat).",
        status: "pending",
        refundAmountUsd: 237.5,
        createdAt: "2026-05-20T13:30:00.000Z",
      },
    );
  }

  if (john) {
    items.push({
      id: "cx-john-1",
      registrationId: john.id,
      requesterEmail: john.email,
      requesterName: john.name,
      type: "refund",
      reason: "Cooperative budget reallocation — requesting 50% refund within the July window.",
      status: "pending",
      refundAmountUsd: 75,
      createdAt: "2026-05-22T10:00:00.000Z",
    });
  }

  return items;
}

function seedLivePolls(): LivePoll[] {
  return [
    {
      id: "poll-closing-theme",
      title: "Closing plenary — audience pulse",
      question: "Which sub-theme should lead the Kigali Call to Action?",
      description: "Live poll during the closing plenary (FR-6.2). One vote per delegate.",
      options: [
        { id: "po-soil", label: "Soil health & fertility" },
        { id: "po-food", label: "Inclusive food systems" },
        { id: "po-policy", label: "Policy & governance" },
        { id: "po-climate", label: "Climate resilience" },
        { id: "po-farmer", label: "Farmer-led innovation" },
      ],
      sessionId: "ss2",
      audience: {
        roles: ["attendee", "speaker", "exhibitor", "registration_desk", "moderator"],
        ticketCategoryIds: [],
        participationKinds: [],
      },
      status: "open",
      resultsVisible: false,
      createdAt: "2026-08-14T15:30:00.000Z",
      createdBy: "Symposium Admin",
      openedAt: "2026-08-14T15:35:00.000Z",
    },
    {
      id: "poll-speaker-priority",
      title: "Speaker lounge check-in",
      question: "Which logistics topic needs more support tomorrow?",
      options: [
        { id: "po-av", label: "AV & rehearsal slots" },
        { id: "po-transport", label: "Airport transfers" },
        { id: "po-dietary", label: "Dietary requirements" },
      ],
      audience: {
        roles: ["speaker"],
        ticketCategoryIds: [],
        participationKinds: [],
      },
      status: "draft",
      resultsVisible: false,
      createdAt: "2026-08-13T09:00:00.000Z",
      createdBy: "Event Moderator",
    },
    {
      id: "poll-exhibitor-energy",
      title: "Exhibitor hall — quick poll",
      question: "Best time for a guided exhibitor walk-through?",
      options: [
        { id: "po-am", label: "Day 1 · 11:00" },
        { id: "po-lunch", label: "Day 1 · 13:00" },
        { id: "po-pm", label: "Day 2 · 10:30" },
      ],
      audience: {
        roles: ["exhibitor"],
        ticketCategoryIds: [],
        participationKinds: ["exhibitor", "both"],
      },
      status: "closed",
      resultsVisible: true,
      createdAt: "2026-08-12T14:00:00.000Z",
      createdBy: "Symposium Admin",
      openedAt: "2026-08-12T14:05:00.000Z",
      closedAt: "2026-08-12T16:00:00.000Z",
    },
  ];
}

function seedPollVotes(): PollVote[] {
  const votes: PollVote[] = [
    { id: "pv1", pollId: "poll-closing-theme", optionId: "po-soil", voterEmail: "alice@example.rw", voterName: "Alice Uwimana", voterRole: "attendee", votedAt: "2026-08-14T15:40:00.000Z" },
    { id: "pv2", pollId: "poll-closing-theme", optionId: "po-climate", voterEmail: "j.okello@example.ug", voterName: "John Okello", voterRole: "attendee", votedAt: "2026-08-14T15:41:00.000Z" },
    { id: "pv3", pollId: "poll-closing-theme", optionId: "po-farmer", voterEmail: "speaker@nas2026.rw", voterName: "Dr. Mukeshimana Solange", voterRole: "speaker", votedAt: "2026-08-14T15:42:00.000Z" },
    { id: "pv4", pollId: "poll-exhibitor-energy", optionId: "po-lunch", voterEmail: "exhibitor@nas2026.rw", voterName: "AgriTools Rwanda", voterRole: "exhibitor", votedAt: "2026-08-12T14:20:00.000Z" },
    { id: "pv5", pollId: "poll-exhibitor-energy", optionId: "po-am", voterEmail: "eric@agritools.rw", voterName: "Eric Mukamana", voterRole: "exhibitor", votedAt: "2026-08-12T14:25:00.000Z" },
  ];
  return votes;
}

function createSeed(): AppStore {
  const baseRegs = seedRegistrations();
  const { groups, registrations } = seedGroupRegistrations(baseRegs);
  return {
    version: STORE_VERSION,
    users: seedUsers(),
    invites: [],
    auditLog: AUDIT_LOG.map((a) => ({ ...a })),
    ticketPlans: TICKET_CATEGORIES.map((t) => ({
      ...t,
      subtitle: t.description.slice(0, 60),
      requiresVerification: t.id === "student" ? "student" : t.id === "farmer" ? "farmer" : null,
      isMediaAccreditation: t.id === "media",
      capacity: DEFAULT_PLAN_CAPACITY[t.id] ?? 100,
      soldOutOverride: false,
    })),
    groupRegistrations: groups,
    registrations: [
      ...registrations,
      {
        id: "r-media-pending",
        name: "Claudine Uwase",
        email: "c.uwase@kigalitoday.rw",
        country: "Rwanda",
        category: "Media / Press",
        categoryId: "media",
        amountUsd: 0,
        status: "pending" as const,
        verificationStatus: "none" as const,
        createdAt: "2026-05-18",
        details: {
          ticketId: "NAS26-MEDIA-1001",
          title: "Senior Reporter",
          org: "Kigali Today",
          phone: "+250 788 555 010",
          hear: "Press invitation",
          roleNote: "media",
        },
      },
      {
        id: "r-media-approved",
        name: "Sarah Mensah",
        email: "s.mensah@africanews.com",
        country: "Ghana",
        category: "Media / Press",
        categoryId: "media",
        amountUsd: 0,
        status: "comp" as const,
        verificationStatus: "none" as const,
        createdAt: "2026-05-12",
        checkedIn: false,
        details: {
          ticketId: "NAS26-MEDIA-1002",
          title: "Correspondent",
          org: "Africa News Network",
          phone: "+233 24 000 1234",
          hear: "MINAGRI press list",
          roleNote: "media",
        },
      },
    ],
    documentVerifications: seedDocumentVerifications(),
    speakerApplications: seedSpeakerApplications(),
    mediaApplications: seedMediaApplications(registrations),
    organizationApplications: seedOrgApplications(),
    approvedOrganizations: seedApprovedOrgs(),
    sponsorshipTiers: seedSponsorshipTiers(),
    sponsorshipDeliverables: seedSponsorshipDeliverables(),
    sessionRatings: seedSessionRatings(),
    sponsorshipInvoices: seedSponsorshipInvoices(),
    runOfShow: seedRunOfShow(),
    zoomMeetings: [],
    remoteInteractions: seedRemoteInteractions(),
    recordings: [],
    exhibitorLeads: seedExhibitorLeads(),
    exhibitorStaff: seedExhibitorStaff(),
    checkInScans: [],
    speakerAbstracts: ABSTRACTS.map((a) => ({
      id: a.id,
      speakerEmail: "speaker@nas2026.rw",
      title: a.title,
      authors: a.authors,
      track: a.track,
      body: "",
      documentName: `${a.id}-abstract.pdf`,
      status: a.status === "accepted" ? "accepted" : a.status === "rejected" ? "rejected" : a.status === "under-review" ? "under-review" : "submitted",
      submittedAt: a.submittedAt,
    })),
    sessions: SESSIONS.map((s) => ({ ...s })),
    exhibitorBoothPackage: seedExhibitorBoothPackage(),
    ...(() => {
      const sm = seedSpeakerMaterialsData();
      return {
        sessionMaterials: sm.sessionMaterials,
        speakerAvRequirements: sm.speakerAvRequirements,
        speakerDecks: sm.speakerDecks,
      };
    })(),
    platformSettings: seedPlatformSettings(),
    certificateTemplate: seedCertificateTemplate(),
    surveyResponses: seedSurveyResponses(),
    announcements: [],
    announcementDismissals: [],
    newsPosts: NEWS.map((n) => ({ ...n })),
    committeeMembers: seedCommittee(),
    galleryImages: seedGalleryImages(),
    previousPresentations: seedPreviousPresentations(),
    rooms: seedRooms(),
    booths: seedBooths(),
    speakerProfiles: seedSpeakerProfiles(),
    cancellationRequests: seedCancellationRequests(registrations),
    waitlist: seedWaitlist(),
    attendeeProfiles: seedAttendeeProfiles(registrations),
    connectionRequests: seedConnectionRequests(),
    chatMessages: seedChatMessages(),
    livePolls: seedLivePolls(),
    pollVotes: seedPollVotes(),
  };
}

export function getThreadId(emailA: string, emailB: string) {
  return [emailA.toLowerCase(), emailB.toLowerCase()].sort().join("::");
}

export function upsertAttendeeProfile(profile: Partial<AttendeeProfile> & { email: string; name: string }) {
  patchStore((s) => {
    const existing = s.attendeeProfiles.find((p) => p.email === profile.email);
    const next: AttendeeProfile = existing
      ? { ...existing, ...profile }
      : {
          org: "",
          country: "Rwanda",
          interests: [],
          subThemeInterests: [],
          publicInDirectory: true,
          allowMessages: true,
          allowExhibitorContact: true,
          ...profile,
        };
    const attendeeProfiles = existing
      ? s.attendeeProfiles.map((p) => (p.email === profile.email ? next : p))
      : [...s.attendeeProfiles, next];
    return { ...s, attendeeProfiles };
  });
}

export function getExhibitorOrgId() {
  return loadStore().approvedOrganizations[0]?.id ?? "ex1";
}

export function findRegistrationByTicketId(ticketId: string) {
  return loadStore().registrations.find((r) => r.details?.ticketId === ticketId);
}

export function findStaffByInviteToken(token: string) {
  return loadStore().exhibitorStaff.find((s) => s.inviteToken === token);
}

export function loadStore(): AppStore {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seed = createSeed();
      saveStore(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as AppStore;
    if (parsed.version !== STORE_VERSION) {
      const migrated = migrateStore(parsed);
      saveStore(migrated);
      return migrated;
    }
    const repaired = repairStore(parsed);
    if (repaired !== parsed) {
      saveStore(repaired);
    }
    return repaired;
  } catch {
    const seed = createSeed();
    saveStore(seed);
    return seed;
  }
}

export function saveStore(store: AppStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  LISTENERS.forEach((fn) => fn());
}

export function patchStore(patch: Partial<AppStore> | ((prev: AppStore) => AppStore)) {
  const prev = loadStore();
  const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
  saveStore(next);
  return next;
}

export function subscribeStore(fn: () => void) {
  LISTENERS.add(fn);
  return () => {
    LISTENERS.delete(fn);
  };
}

export function appendAudit(who: string, action: string, target: string) {
  patchStore((s) => ({
    ...s,
    auditLog: [{ id: uid("al"), who, action, target, at: new Date().toLocaleString() }, ...s.auditLog].slice(0, 100),
  }));
}

export function getTicketPlans(): TicketPlan[] {
  return loadStore().ticketPlans;
}

export function getLiveZoomMeeting(): ZoomMeeting | undefined {
  const store = loadStore();
  return store.zoomMeetings.find((z) => z.status === "live");
}

export function getLiveRunOfShowItem(): RunOfShowItem | undefined {
  return loadStore().runOfShow.find((r) => r.status === "live");
}

export function getSessionMaterials(sessionId: string): SessionMaterial[] {
  return loadStore().sessionMaterials.filter((m) => m.sessionId === sessionId);
}

export function getSpeakerAv(email: string): SpeakerAvRequirements | undefined {
  return loadStore().speakerAvRequirements.find((a) => a.speakerEmail === email);
}

export function getSpeakerApplicationForEmail(email: string): SpeakerApplication | undefined {
  return loadStore().speakerApplications.find((a) => a.email === email);
}

export function upgradeUserToSpeaker(email: string, name: string) {
  patchStore((s) => {
    const existing = s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const users = existing
      ? s.users.map((u) =>
          u.email.toLowerCase() === email.toLowerCase()
            ? { ...u, role: "speaker" as Role, status: "active" as UserStatus, name }
            : u,
        )
      : [
          ...s.users,
          {
            id: uid("u"),
            name,
            email,
            role: "speaker" as Role,
            status: "active" as UserStatus,
            lastLogin: "Never",
          },
        ];
    return { ...s, users };
  });
}

export function upgradeUserToExhibitor(email: string, name: string) {
  patchStore((s) => {
    const key = email.toLowerCase();
    const existing = s.users.find((u) => u.email.toLowerCase() === key);
    const users = existing
      ? s.users.map((u) =>
          u.email.toLowerCase() === key ? { ...u, role: "exhibitor" as Role, status: "active" as UserStatus, name } : u,
        )
      : [
          ...s.users,
          {
            id: uid("u"),
            name,
            email,
            role: "exhibitor" as Role,
            status: "active" as UserStatus,
            lastLogin: "Never",
          },
        ];
    return { ...s, users };
  });
}

export function findUserByEmail(email: string) {
  return loadStore().users.find((u) => u.email === email);
}

export { uid };

// Re-export for components that still use legacy ABSTRACTS shape
export type { SubTheme };
