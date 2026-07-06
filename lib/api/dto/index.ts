export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type LoginDto = { email: string; password: string };
export type RegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organization?: string;
  country?: string;
};
export type RefreshDto = { refreshToken: string };
export type ForgotPasswordDto = { email: string };
export type ResetPasswordDto = { token: string; newPassword: string };
export type VerifyEmailDto = { token: string };

export type SymposiumStatus = "draft" | "published" | "archived";

export type SymposiumCountdownDto = {
  target: string;
  isPast: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type SymposiumStatsDto = {
  registrationCount: number;
  sessionCount: number;
};

export type SymposiumDto = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  theme?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  countdownTarget?: string | null;
  status: SymposiumStatus;
  heroImageUrl?: string | null;
  exchangeRateUsdRwf?: number | null;
  vatEnabled: boolean;
  vatPercent?: number | null;
  countdown?: SymposiumCountdownDto | null;
  stats?: SymposiumStatsDto;
  createdAt: string;
  updatedAt: string;
};

export type UserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  organization?: string | null;
  country?: string | null;
  title?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  linkedInUrl?: string | null;
  interests?: string[] | null;
  dietaryRequirements?: string | null;
  accessibilityNeeds?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  showInDirectory: boolean;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileDto = Partial<
  Pick<
    UserDto,
    | "firstName"
    | "lastName"
    | "phone"
    | "organization"
    | "country"
    | "title"
    | "bio"
    | "profileImageUrl"
    | "linkedInUrl"
    | "interests"
    | "dietaryRequirements"
    | "accessibilityNeeds"
    | "showInDirectory"
  >
>;

export type SessionSpeakerDto = {
  id: string;
  name: string;
  title?: string | null;
  organization?: string | null;
  photoUrl?: string | null;
  role: string;
};

export type SessionDto = {
  id: string;
  symposiumId: string;
  trackId?: string | null;
  title: string;
  description?: string | null;
  sessionType: string;
  startTime?: string | null;
  endTime?: string | null;
  dayIndex?: number | null;
  room?: string | null;
  meetingUrl?: string | null;
  meetingProvider?: string | null;
  status: string;
  isPublished: boolean;
  isLiveNow: boolean;
  speakers?: SessionSpeakerDto[];
  createdAt: string;
  updatedAt: string;
};

export type TrackDto = {
  id: string;
  symposiumId: string;
  name: string;
  color?: string | null;
  description?: string | null;
  sortOrder: number;
};

export type SpeakerDto = {
  id: string;
  symposiumId: string;
  userId?: string | null;
  name: string;
  title?: string | null;
  organization?: string | null;
  country?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  isKeynote?: boolean;
  isFeatured?: boolean;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TicketCategoryDto = {
  id: string;
  symposiumId: string;
  name: string;
  slug: string;
  description?: string | null;
  priceUsd: number;
  priceRwf: number;
  requiresVerification: boolean;
  capacity?: number | null;
  soldCount: number;
  isActive: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  benefits?: Record<string, unknown>[] | null;
  available: number | null;
};

export type CreateTicketCategoryDto = {
  symposiumId: string;
  name: string;
  slug?: string;
  description?: string;
  priceUsd: number;
  priceRwf: number;
  requiresVerification?: boolean;
  capacity?: number;
  isActive?: boolean;
  isSoldOut?: boolean;
  sortOrder?: number;
  benefits?: Record<string, unknown>[];
};

export type UpdateTicketCategoryDto = Partial<Omit<CreateTicketCategoryDto, "symposiumId">>;

export type Currency = "USD" | "RWF";

export type RegistrationStatus =
  | "draft"
  | "pending"
  | "pending_payment"
  | "confirmed"
  | "paid"
  | "pending_verification"
  | "active"
  | "rejected"
  | "cancelled"
  | "expired"
  | "refund_requested"
  | "refunded"
  | "waitlisted";

export type TicketCategorySummaryDto = {
  id: string;
  name: string;
  slug: string;
  priceUsd: number;
  priceRwf: number;
  requiresVerification: boolean;
};

export type RegistrationDto = {
  id: string;
  userId: string;
  symposiumId: string;
  ticketCategoryId?: string | null;
  status: RegistrationStatus;
  attendanceType?: string | null;
  verificationDocUrl?: string | null;
  verificationStatus?: string | null;
  facePhotoUrl?: string | null;
  faceVerificationStatus?: string | null;
  isOnSite?: boolean;
  groupId?: string | null;
  amountUsd?: number | null;
  amountRwf?: number | null;
  currency?: string | null;
  qrCode?: string | null;
  ticketPdfUrl?: string | null;
  referralSource?: string | null;
  consents?: Record<string, boolean> | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  ticketCategory?: TicketCategorySummaryDto;
  qrData?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceType = "in_person" | "virtual" | "hybrid";

export type CreateRegistrationDto = {
  symposiumId: string;
  attendanceType?: AttendanceType;
  referralSource?: string;
  consents?: Record<string, boolean>;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organization?: string;
  country?: string;
  title?: string;
};

export type UpdateRegistrationCategoryDto = {
  ticketCategoryId: string;
  currency: Currency;
  verificationDocUrl?: string;
};

export type GroupRegistrationMemberDto = {
  userId?: string;
  email?: string;
  ticketCategoryId: string;
  attendanceType?: AttendanceType;
  consents?: Record<string, boolean>;
};

export type CreateGroupRegistrationDto = {
  symposiumId: string;
  organizationName: string;
  currency: Currency;
  members: GroupRegistrationMemberDto[];
};

export type PaymentProvider = "mtn" | "airtel";

export type InitiatePaymentDto = {
  registrationId: string;
  provider: PaymentProvider;
  phone: string;
  description?: string;
};

export type BankTransferProformaDto = { registrationId: string; notes?: string };

export type PaymentTransactionDto = {
  id: string;
  registrationId: string;
  amount: number;
  currency: Currency;
  method: string;
  provider: string;
  status: string;
  externalTransId?: string | null;
  phone?: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentInitiateResponseDto = PaymentTransactionDto & {
  registrationCompleted: boolean;
  registrationStatus?: RegistrationStatus;
  message?: string;
};

export type UploadFileType =
  | "avatar"
  | "abstract"
  | "paper"
  | "sponsor_logo"
  | "verification_doc"
  | "certificate_template"
  | "symposium_asset"
  | "announcement_image"
  | "exhibitor_material";

export type UploadFileResponseDto = {
  url: string;
  publicId: string;
  type: UploadFileType;
  mimeType: string;
  bytes: number;
};

export type AnnouncementDto = {
  id: string;
  symposiumId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CmsPageDto = {
  id: string;
  symposiumId: string;
  key: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type FaqDto = {
  id: string;
  symposiumId: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type CreateContactMessageDto = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type CreateSessionDto = {
  symposiumId: string;
  trackId?: string;
  title: string;
  description?: string;
  sessionType?: string;
  startTime?: string;
  endTime?: string;
  dayIndex?: number;
  room?: string;
  meetingUrl?: string;
  meetingProvider?: string;
  status?: string;
  isPublished?: boolean;
  speakers?: Array<{ speakerId: string; role: string }>;
};

export type UpdateSessionDto = Partial<CreateSessionDto>;

export type CreateTrackDto = {
  symposiumId: string;
  name: string;
  slug?: string;
  color?: string;
};

export type UpdateTrackDto = Partial<CreateTrackDto>;

export type CreateSpeakerDto = {
  symposiumId: string;
  name: string;
  title?: string;
  organization?: string;
  country?: string;
  bio?: string;
  photoUrl?: string;
  isKeynote?: boolean;
  isFeatured?: boolean;
  category?: string;
};

export type UpdateSpeakerDto = Partial<CreateSpeakerDto>;

export type CreateAnnouncementDto = {
  symposiumId: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  isPublished?: boolean;
};

export type UpdateAnnouncementDto = Partial<CreateAnnouncementDto>;

export type DeskWalkInDto = {
  symposiumId: string;
  ticketCategoryId: string;
  currency: Currency;
  email?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  attendanceType?: AttendanceType;
};

export type ConfirmManualPaymentDto = {
  externalTransId?: string;
  notes?: string;
};

export type AdminUpdateRegistrationDto = { status?: RegistrationStatus };

export type ExhibitorAdminDto = {
  id: string;
  symposiumId: string;
  sponsorId?: string | null;
  packageId?: string | null;
  contactUserId: string;
  companyName?: string | null;
  boothNumber?: string | null;
  staffPassQuota: number;
  package?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExhibitorDto = {
  symposiumId: string;
  contactUserId: string;
  sponsorId?: string;
  packageId?: string;
  companyName?: string;
  boothNumber?: string;
  staffPassQuota?: number;
};

export type UpdateExhibitorDto = Partial<Omit<CreateExhibitorDto, "symposiumId">>;

export type RoleDto = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssignRoleDto = { roleId: string; symposiumId?: string };

export type AdminCreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId?: string;
  symposiumId?: string;
};

export type AdminUpdateUserDto = Partial<
  Pick<
    UserDto,
    | "firstName"
    | "lastName"
    | "phone"
    | "organization"
    | "country"
    | "title"
    | "bio"
    | "profileImageUrl"
    | "linkedInUrl"
    | "interests"
    | "dietaryRequirements"
    | "accessibilityNeeds"
    | "showInDirectory"
  >
> & { isActive?: boolean; emailVerified?: boolean };

export type ReviewDto = {
  id: string;
  submissionId: string;
  reviewerId: string;
  scores?: Record<string, number> | null;
  comments?: string | null;
  recommendation?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceRefundDto = {
  id: string;
  registrationId: string;
  userId: string;
  type: RefundType;
  reason: string;
  status: RefundStatus;
  adminNotes?: string | null;
  attendeeEmail: string;
  attendeeName: string;
  symposiumId: string;
  createdAt: string;
  updatedAt: string;
};

export type SponsorDto = {
  id: string;
  symposiumId: string;
  name: string;
  tier: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SponsorshipApplicationDto = {
  id: string;
  symposiumId: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  desiredTier: string;
  message?: string | null;
  wantsExhibitorBooth: boolean;
  status: "pending" | "approved" | "rejected" | "invoiced" | string;
  adminNotes?: string | null;
  sponsorId?: string | null;
  contactUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SponsorshipApplicationStatsDto = {
  pending: number;
  approved: number;
  rejected: number;
  invoiced: number;
  total: number;
};

export type SponsorshipInvoiceDto = {
  id: string;
  sponsorshipApplicationId: string;
  sponsorId: string;
  symposiumId: string;
  invoiceNumber: string;
  tier: string;
  amount: number;
  currency: string;
  status: string;
  paymentInstructions?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SponsorshipTierPricingDto = {
  tier: string;
  amountUsd: number;
  amountRwf: number;
  defaultCurrency?: string;
};

export type ExhibitorPackageDto = {
  id: string;
  symposiumId: string;
  name: string;
  slug: string;
  description?: string | null;
  staffPassQuota: number;
  boothSize?: string | null;
  priceUsd: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ExhibitorMaterialDto = {
  id: string;
  exhibitorId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  createdAt: string;
};

export type ExhibitorProfileDto = {
  id: string;
  symposiumId: string;
  sponsorId?: string | null;
  packageId?: string | null;
  contactUserId: string;
  companyName?: string | null;
  boothNumber?: string | null;
  staffPassQuota: number;
  package?: ExhibitorPackageDto | null;
  sponsorName?: string | null;
  materials: ExhibitorMaterialDto[];
  staffPassesUsed: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateExhibitorProfileDto = {
  companyName?: string;
  boothNumber?: string | null;
};

export type CreateExhibitorMaterialDto = {
  fileUrl: string;
  fileName: string;
  fileType?: string;
};

export type ExhibitorStaffPassDto = {
  id: string;
  exhibitorId: string;
  email: string;
  holderName: string;
  registrationId?: string | null;
  status: string;
  createdAt: string;
};

export type CreateExhibitorStaffPassDto = {
  email: string;
  holderName: string;
};

export type ScanExhibitorLeadDto = {
  registrationId?: string;
  qrPayload?: string;
  consentGiven: boolean;
};

export type ExhibitorLeadDto = {
  id: string;
  exhibitorId: string;
  registrationId: string;
  scannedAt: string;
  consentGiven: boolean;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
};

export type SpeakerDashboardSessionDto = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};

export type SpeakerDashboardDto = {
  speakerId: string;
  symposiumId: string;
  name: string;
  sessionsCount: number;
  submissionsCount: number;
  materialsCount: number;
  upcomingSessions: SpeakerDashboardSessionDto[];
};

export type SpeakerMaterialDto = {
  id: string;
  sessionId: string;
  speakerId: string;
  fileUrl: string;
  equipmentRequirements?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSpeakerMaterialDto = {
  fileUrl: string;
};

export type UpdateSpeakerMaterialEquipmentDto = {
  equipmentRequirements: Record<string, unknown>;
};

export type FinanceTransactionDto = {
  id: string;
  registrationId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: string;
  externalTransId?: string | null;
  phone?: string | null;
  attendeeEmail: string;
  attendeeName: string;
  symposiumId: string;
  registrationStatus: string;
  ticketCategoryName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceSummaryDto = {
  symposiumId?: string;
  totalRevenue: number;
  completedTransactions: number;
  pendingTransactions: number;
  pendingRefunds: number;
  approvedRefunds: number;
};

export type QrCheckInDto = { qrData: string; sessionId?: string };
export type ManualCheckInDto = { registrationId?: string; email?: string; sessionId?: string };

export type AttendanceCheckInResponseDto = {
  id: string;
  registrationId: string;
  sessionId?: string | null;
  checkedInAt: string;
  method: string;
  verifiedById?: string | null;
};

export type AttendanceHistoryResponseDto = {
  registrationId: string;
  checkIns: AttendanceCheckInResponseDto[];
};

export type PendingVerificationDto = {
  id: string;
  userId: string;
  symposiumId: string;
  status: RegistrationStatus;
  verificationDocUrl?: string | null;
  userEmail?: string;
  userName?: string | null;
  createdAt: string;
};

export type VerificationDeskAction = "approve" | "reject";

export type VerifyChecklistDto = {
  action: VerificationDeskAction;
  items?: Array<{ key: string; verified: boolean; notes?: string }>;
  notes?: string;
};

export type MediaAccreditationStatus = "pending" | "approved" | "rejected" | "revoked";

export type MediaAccreditationDto = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  outletName: string;
  outletType?: string | null;
  jobTitle?: string | null;
  country?: string | null;
  pressCardUrl?: string | null;
  coverageType?: string | null;
  equipmentNeeds?: string | null;
  status: MediaAccreditationStatus;
  adminNotes?: string | null;
  createdAt: string;
};

export type UpdateMediaAccreditationDto = {
  status: MediaAccreditationStatus;
  adminNotes?: string;
};

export type MediaAccreditationStatsDto = {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
};

/** Admin/desk manual onboarding — maps to future POST /cms/admin/media-accreditations */
export type CreateMediaAccreditationAdminDto = {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  jobTitle?: string;
  outletName: string;
  outletType?: string;
  outletWebsite?: string;
  outletCountry?: string;
  editorName?: string;
  editorEmail?: string;
  coverageType?: string;
  equipmentNeeds?: string;
  pressCardUrl?: string;
  letterUrl?: string;
  assignmentUrl?: string;
  /** When true, accreditation is approved on creation (default for desk walk-ins). */
  autoApprove?: boolean;
  /** When true, backend sends set-password / welcome email (simulated until endpoint exists). */
  sendWelcomeEmail?: boolean;
  adminNotes?: string;
};

export type CreateMediaAccreditationAdminResultDto = {
  accreditation: MediaAccreditationDto;
  userCreated: boolean;
  registrationCreated: boolean;
  welcomeEmailSent: boolean;
  /** True when the frontend used local mock because the admin endpoint is not deployed yet. */
  simulated?: boolean;
};

/** Optional fields persisted in mock layer until backend extends MediaAccreditation model. */
export type MediaAccreditationExtended = MediaAccreditationDto & {
  outletWebsite?: string | null;
  outletCountry?: string | null;
  editorName?: string | null;
  editorEmail?: string | null;
  letterUrl?: string | null;
  assignmentUrl?: string | null;
  manuallyAdded?: boolean;
};

export type SubmissionDecision = "accept" | "reject" | "revision_required";

export type SubmissionDecisionDto = {
  decision: SubmissionDecision;
  comments?: string;
};

export type AdminListSubmissionsParams = {
  page?: number;
  limit?: number;
  symposiumId?: string;
  status?: string;
  presentationType?: PresentationType;
  userId?: string;
  withinDeadlineOnly?: boolean;
};

export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

export type UserScheduleEntryDto = {
  id: string;
  sessionId: string;
  createdAt: string;
  session: SessionDto;
};

export type RefundType = "full" | "partial";
export type RefundStatus =
  | "pending"
  | "requested"
  | "secretariat_review"
  | "approved"
  | "rejected"
  | "processed"
  | "completed";

export type CreateRefundRequestDto = {
  registrationId: string;
  type: RefundType;
  reason: string;
};

export type RefundRequestDto = {
  id: string;
  registrationId: string;
  userId: string;
  type: RefundType;
  reason: string;
  status: RefundStatus;
  adminNotes?: string | null;
  processedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PresentationType = "oral" | "poster" | "workshop";

export type SubmissionAuthorDto = {
  name: string;
  affiliation?: string;
  isPrimary?: boolean;
};

export type CreateSubmissionDto = {
  symposiumId: string;
  title: string;
  abstract: string;
  subTheme?: string;
  presentationType: PresentationType;
  authors: SubmissionAuthorDto[];
  fileUrl?: string;
};

export type SubmissionDto = {
  id: string;
  symposiumId: string;
  userId: string;
  title: string;
  abstract: string;
  subTheme?: string | null;
  presentationType: PresentationType;
  fileUrl?: string | null;
  status: string;
  deadlineOverride?: boolean;
  authors: Array<{ id: string; name: string; affiliation?: string | null; isPrimary: boolean }>;
  createdAt: string;
  updatedAt: string;
};

export type CertificateDto = {
  id: string;
  registrationId: string;
  fileUrl: string;
  issuedAt: string;
  issuedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsPeriod = "day" | "week" | "month";

export type AnalyticsDashboardDto = {
  symposiumId: string;
  registrationsCount: number;
  revenueSum: number;
  submissionsCount: number;
  speakersCount: number;
};

export type TrendPointDto = { period: string; count: number };

export type TicketDistributionItemDto = {
  categoryId: string;
  categoryName: string;
  count: number;
};

export type RevenuePeriodItemDto = {
  period: string;
  revenue: number;
  transactionCount: number;
};

export type AttendanceHeatmapCellDto = {
  dayOfWeek: number;
  hourOfDay: number;
  checkInCount: number;
};

export type SurveyDto = {
  id: string;
  symposiumId: string;
  title: string;
  questions: Record<string, unknown>[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSurveyDto = {
  symposiumId: string;
  title: string;
  questions: Record<string, unknown>[];
  isActive?: boolean;
};

export type UpdateSurveyDto = Partial<Omit<CreateSurveyDto, "symposiumId">>;

export type SubmitSurveyResponseDto = { answers: Record<string, unknown> };

export type SurveyResponseRecordDto = {
  id: string;
  surveyId: string;
  userId: string;
  answers: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type SurveyResultsDto = {
  surveyId: string;
  responseCount: number;
  aggregates: Record<string, unknown>;
};

export type SessionQuestionDto = {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  isApproved: boolean;
  isDisplayed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSessionQuestionDto = { content: string };
export type ModerateSessionQuestionDto = { isApproved?: boolean; isDisplayed?: boolean };

export type SessionPollDto = {
  id: string;
  sessionId: string;
  question: string;
  options: string[];
  isActive: boolean;
  results?: number[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePollDto = { question: string; options: string[]; isActive?: boolean };
export type VotePollDto = { optionIndex: number };

export type SessionRatingDto = {
  id: string;
  sessionId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSessionRatingDto = { rating: number; comment?: string };

export type SessionMessageDto = {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSessionMessageDto = { content: string };

export type ConnectionRequestStatus = "pending" | "accepted" | "rejected";

export type DirectoryUserDto = {
  id: string;
  firstName: string;
  lastName: string;
  organization?: string | null;
  country?: string | null;
  title?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  linkedInUrl?: string | null;
  interests?: string[] | null;
};

export type NetworkingDirectoryParams = {
  page?: number;
  limit?: number;
  country?: string;
  organization?: string;
  interest?: string;
};

export type ConnectionRequestDto = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateConnectionRequestDto = { toUserId: string };
export type UpdateConnectionStatusDto = { status: "accepted" | "rejected" };

export type ConnectionMessageDto = {
  id: string;
  connectionId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateConnectionMessageDto = { content: string };

export type ResourceAccessLevel = "public" | "registered" | "speaker" | "staff";

export type ResourceDto = {
  id: string;
  symposiumId: string;
  sessionId?: string | null;
  title: string;
  fileUrl: string;
  accessLevel: ResourceAccessLevel;
  createdAt: string;
  updatedAt: string;
};

export type CreateResourceDto = {
  symposiumId: string;
  sessionId?: string;
  title: string;
  fileUrl: string;
  accessLevel?: ResourceAccessLevel;
};

export type SymposiumSettingsDto = {
  symposiumId: string;
  registration: {
    enableRegistration?: boolean;
    enableWaitlist?: boolean;
    allowTicketTransfer?: boolean;
    allowRefundRequests?: boolean;
  };
  payments: {
    enableMomo?: boolean;
    enableBankTransfer?: boolean;
    enableOnSitePayment?: boolean;
    enableOnSiteCash?: boolean;
  };
  notifications: {
    emailOnRegistration?: boolean;
    emailOnPayment?: boolean;
    emailOnCheckIn?: boolean;
  };
  desk: {
    enableOnSiteRegistration?: boolean;
    enableBadgePrinting?: boolean;
  };
  sponsorship?: {
    enableApplications?: boolean;
    tierPricing?: Array<{ tier: string; amountUsd: number; amountRwf: number }>;
    bankTransferInstructions?: string;
    defaultInvoiceCurrency?: "USD" | "RWF";
  };
};

export type UpdateSymposiumSettingsDto = Partial<Omit<SymposiumSettingsDto, "symposiumId">>;

export type WaitlistEntryDto = {
  id: string;
  registrationId: string;
  symposiumId: string;
  ticketCategoryId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationReceiptDto = {
  registrationId: string;
  symposiumId: string;
  status: RegistrationStatus;
  ticketCategoryName?: string | null;
  amountUsd?: number | null;
  amountRwf?: number | null;
  currency?: string | null;
  ticketPdfUrl?: string | null;
  payment?: {
    transactionId?: string | null;
    amount?: number | null;
    currency?: string | null;
    method?: string | null;
    status?: string | null;
    paidAt?: string | null;
    externalTransId?: string | null;
  } | null;
  createdAt: string;
};

export type CommitteeMemberDto = {
  id: string;
  symposiumId: string;
  name: string;
  role: string;
  organization?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertCommitteeMemberDto = {
  symposiumId: string;
  name: string;
  role: string;
  organization?: string;
  photoUrl?: string;
};

export type ContactMessageInboxDto = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type UpsertFaqDto = {
  symposiumId: string;
  question: string;
  answer: string;
  sortOrder?: number;
};

export type UpsertCmsPageDto = {
  symposiumId: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
};

export type BroadcastPaymentFilter = "paid" | "pending" | "all";

export type AdminBroadcastDto = {
  symposiumId: string;
  title: string;
  body: string;
  ticketCategoryId?: string;
  paymentStatus?: BroadcastPaymentFilter;
};

export type AdminBroadcastResultDto = {
  queued: number;
  symposiumId: string;
};

export type AdminDeadlineOverrideDto = { deadlineOverride: boolean };

export type AssignReviewersDto = { reviewerIds: string[] };

export type CreateReviewDto = {
  scores?: Record<string, number>;
  comments?: string;
  recommendation?: string;
};

export type SetFacePhotoDto = { facePhotoUrl: string };
export type FaceVerificationDto = { status: "approved" | "rejected" };
export type DeskCashPaymentDto = { registrationId: string; notes?: string };

export type VenueRoomDto = {
  id: string;
  symposiumId: string;
  name: string;
  capacity?: number | null;
  floor?: string | null;
  avSetup?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertVenueRoomDto = {
  symposiumId: string;
  name: string;
  capacity?: number;
  floor?: string;
  avSetup?: string;
};

export type UpdateVenueRoomDto = Partial<Omit<UpsertVenueRoomDto, "symposiumId">>;

export type RunOfShowItemType = "session" | "break" | "custom";
export type RunOfShowItemStatus = "upcoming" | "live" | "done";

export type RunOfShowItemDto = {
  id: string;
  symposiumId: string;
  sessionId?: string | null;
  itemType: RunOfShowItemType;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  dayIndex: number;
  sortOrder: number;
  status: RunOfShowItemStatus;
  notes?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertRunOfShowItemDto = {
  symposiumId: string;
  sessionId?: string;
  itemType: RunOfShowItemType;
  title: string;
  startTime?: string;
  endTime?: string;
  dayIndex?: number;
  sortOrder?: number;
  status?: RunOfShowItemStatus;
  notes?: string;
  ownerName?: string;
  ownerEmail?: string;
};

export type UpdateRunOfShowItemDto = Partial<Omit<UpsertRunOfShowItemDto, "symposiumId">>;

export type ReorderRunOfShowDto = { day: number; orderedIds: string[] };

export type ExhibitionBoothStatus = "available" | "reserved" | "occupied";

export type ExhibitionBoothDto = {
  id: string;
  symposiumId: string;
  code: string;
  row: number;
  col: number;
  capacity: number;
  location?: string | null;
  status: ExhibitionBoothStatus;
  dimensions?: string | null;
  floor?: string | null;
  includes?: string[] | null;
  setupWindow?: string | null;
  breakdownWindow?: string | null;
  onSiteContact?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertExhibitionBoothDto = {
  symposiumId: string;
  code: string;
  row?: number;
  col?: number;
  capacity?: number;
  location?: string;
  status?: ExhibitionBoothStatus;
  dimensions?: string;
  floor?: string;
  includes?: string[];
  setupWindow?: string;
  breakdownWindow?: string;
  onSiteContact?: string;
  notes?: string;
};

export type UpdateExhibitionBoothDto = Partial<Omit<UpsertExhibitionBoothDto, "symposiumId">>;

export type SymposiumArchiveItemType = "photo" | "document";

export type SymposiumArchiveItemDto = {
  id: string;
  symposiumId: string;
  itemType: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  thumbnailUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertSymposiumArchiveItemDto = {
  symposiumId: string;
  itemType: SymposiumArchiveItemType;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type UpdateSymposiumArchiveItemDto = Partial<
  Omit<UpsertSymposiumArchiveItemDto, "symposiumId">
>;

export type AdminGroupPaymentStatus = "comp" | "paid" | "pending";

export type AdminGroupDelegateDto = {
  fullName: string;
  email: string;
  jobTitle?: string;
  phone?: string;
};

export type AdminCreateGroupRegistrationDto = {
  symposiumId: string;
  ticketCategoryId: string;
  currency: Currency;
  organizationName: string;
  country?: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone?: string;
  paymentStatus: AdminGroupPaymentStatus;
  delegates: AdminGroupDelegateDto[];
};

export type GroupRegistrationMemberResponseDto = {
  registrationId: string;
  fullName: string;
  email: string;
  jobTitle?: string | null;
  status: string;
  checkedIn: boolean;
};

export type GroupRegistrationAdminDto = {
  id: string;
  groupCode: string;
  symposiumId: string;
  organizationName: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone?: string | null;
  country?: string | null;
  seatCount: number;
  discountPercent: number;
  subtotalUsd: number;
  subtotalRwf: number;
  totalUsd: number;
  totalRwf: number;
  paymentStatus: AdminGroupPaymentStatus;
  checkedInCount: number;
  members: GroupRegistrationMemberResponseDto[];
  createdAt: string;
};

export type AdminUpdateRefundStatusDto = {
  status: RefundStatus;
  adminNotes?: string;
};
