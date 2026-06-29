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
  sortOrder: number;
  benefits?: Record<string, unknown>[] | null;
  available: number | null;
};

export type CreateTicketCategoryDto = {
  symposiumId: string;
  name: string;
  slug: string;
  description?: string;
  priceUsd: number;
  priceRwf: number;
  requiresVerification?: boolean;
  capacity?: number;
  isActive?: boolean;
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

export type ExhibitorProfileDto = {
  id: string;
  symposiumId: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  boothNumber?: string | null;
  tier?: string | null;
  status: string;
};

export type ExhibitorLeadDto = {
  id: string;
  exhibitorId: string;
  scannedAt: string;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  notes?: string | null;
};

export type FinanceTransactionDto = {
  id: string;
  registrationId: string;
  amountUsd: number;
  amountRwf: number;
  currency: string;
  method: string;
  status: string;
  paidAt?: string | null;
  createdAt: string;
};

export type FinanceSummaryDto = {
  totalRevenueUsd: number;
  totalRevenueRwf: number;
  pendingPayments: number;
  completedPayments: number;
  refundRequests: number;
};

export type AttendanceCheckInDto = {
  registrationId: string;
  method: string;
  checkedInAt: string;
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
