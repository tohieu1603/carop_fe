// Generated from be-scan.json — keep in sync with /Users/admin/HieuTo/Duanoto/backend/.agent/be-scan.json

// ===== Enums =====
export type Role = "BUYER" | "SELLER" | "INSPECTOR" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "PENDING_OTP" | "ACTIVE" | "BLOCKED";
export type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type KycRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ListingStatus =
  | "DRAFT_SUBMITTED"
  | "INSPECTION_PENDING"
  | "INSPECTION_REJECTED"
  | "ACTIVE"
  | "HAS_BUYERS"
  | "CLOSING"
  | "SOLD"
  | "HIDDEN";
export type InspectionRequestStatus = "PENDING" | "ASSIGNED" | "DONE" | "CANCELED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type DepositStatus = "PENDING_PAYMENT" | "HELD" | "APPLIED" | "REFUNDING" | "REFUNDED" | "FORFEITED";
export type TxnStatus = "PENDING_BALANCE" | "BALANCE_HELD" | "RECEIPT_CONFIRMED" | "PAID_OUT" | "DISPUTED" | "CANCELED";
export type DisputeStatus = "OPEN" | "RESOLVED" | "CANCELED";
export type Severity = "low" | "medium" | "high";
export type Transmission = "MT" | "AT" | "CVT" | "DCT";
export type Fuel = "gasoline" | "diesel" | "hybrid" | "electric";
export type DisputeDecision = "REFUND_BUYER" | "RELEASE_SELLER" | "SPLIT";
export type UploadFolder = "avatar" | "kyc" | "listing" | "inspection" | "blog";

// ===== Envelope =====
export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: { code: string; message?: string; details?: unknown };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export interface PageResult<T, Cursor = string | number> {
  items: T[];
  nextCursor?: Cursor;
}

// ===== Models =====
export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
  kycStatus: KycStatus;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthMe {
  user: User;
  permissions: string[];
}

export interface UserSession {
  id: string;
  userId: string;
  jti: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  startedAt: string;
  endedAt?: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  frontKey: string;
  backKey: string;
  selfieKey: string;
  status: KycRequestStatus;
  reviewerId?: string;
  reason?: string;
  createdAt: string;
  decidedAt?: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    role: Role;
  };
}

export interface ListingImage {
  id: string;
  listingId: string;
  s3Key: string;
  url?: string;
  position: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  transmission: Transmission;
  fuel: Fuel;
  location: string;
  floodDate: string;
  floodDepthCm: number;
  floodLocation: string;
  severity: Severity;
  damage: Record<string, unknown>;
  repairs: string[];
  inspectionScore?: number;
  warranty?: string;
  description?: string;
  minPrice: string;
  listPrice: string;
  originalPrice: string;
  offerCount: number;
  views: number;
  status: ListingStatus;
  version: number;
  publishedAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  images?: ListingImage[];
  topOffer?: string;
  spread?: string;
  // enriched fields (may appear in detail view)
  isOwner?: boolean;
  inspection?: {
    score?: number;
    approved?: boolean;
    createdAt?: string;
  };
  seller?: {
    type?: string;
    ratingAvg?: number;
    dealsCount?: number;
  };
}

export interface InspectionRequest {
  id: string;
  listingId: string;
  inspectorId?: string;
  isMine?: boolean;
  status: InspectionRequestStatus;
  scheduledAt?: string;
  createdAt: string;
  listing?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    location: string;
    severity: Severity;
    status: ListingStatus;
  };
}

export interface InspectionReport {
  id: string;
  requestId: string;
  inspectorId: string;
  score: number;
  damage: Record<string, unknown>;
  repairs: string[];
  approved: boolean;
  notes?: string;
  createdAt: string;
}

export interface InspectionSummary {
  score?: number;
  approved?: boolean;
  damage?: Record<string, unknown>;
  repairs?: string[];
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  amount: string;
  message?: string;
  status: OfferStatus;
  createdAt: string;
  decidedAt?: string;
  buyer?: {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
  };
}

export interface SellerViewOffer {
  id: string;
  amount: string;
  status: OfferStatus;
  createdAt: string;
  buyerInitials?: string;
}

export interface Deposit {
  id: string;
  buyerId: string;
  listingId: string;
  offerId?: string;
  amount: string;
  idempotencyKey: string;
  txnRef?: string;
  status: DepositStatus;
  viewBy?: string;
  createdAt: string;
  heldAt?: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offerId: string;
  depositId?: string;
  finalPrice: string;
  commission: string;
  status: TxnStatus;
  frozen: boolean;
  balanceTxnRef?: string;
  createdAt: string;
  paidOutAt?: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  openerId: string;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: DisputeDecision;
  rationale?: string;
  createdAt: string;
  resolvedAt?: string;
  transaction?: {
    id: string;
    listingId: string;
    finalPrice: string;
    status: TxnStatus;
  };
  opener?: {
    id: string;
    fullName: string;
    role: Role;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  authorId?: string;
  featured: boolean;
  readTime?: number;
  coverKey?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  html?: string;
}

// ===== Payment shape (returned by deposit/pay-balance) =====
export interface PaymentInit {
  provider: string;
  payUrl?: string;
  txnRef: string;
}
