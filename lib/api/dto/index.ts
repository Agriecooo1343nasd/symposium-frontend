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

export type RegistrationStatus =
  | "draft"
  | "pending_payment"
  | "pending_verification"
  | "active"
  | "cancelled"
  | "expired"
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

export type CreateRegistrationDto = {
  symposiumId: string;
  attendanceType?: string;
  referralSource?: string;
  consents?: Record<string, boolean>;
};

export type UpdateRegistrationCategoryDto = { ticketCategoryId: string };

export type InitiatePaymentDto = {
  registrationId: string;
  phoneNumber: string;
  method?: string;
};

export type BankTransferProformaDto = { registrationId: string };

export type PaymentTransactionDto = {
  id: string;
  registrationId: string;
  amountUsd: number;
  amountRwf: number;
  currency: string;
  method: string;
  provider: string;
  status: string;
  reference?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentInitiateResponseDto = {
  transaction: PaymentTransactionDto;
  providerResponse?: Record<string, unknown>;
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
  symposiumId?: string;
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
