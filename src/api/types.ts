import type { FrequencyType, PaymentType, User } from '../types/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface ExtraScheduleDto {
  label: string;
  paymentType: PaymentType;
  frequency: FrequencyType;
  startDate: string; // YYYY-MM-DD
  count: number;
  amount: number;
}

/**
 * Payload for `POST /properties`. Shape must match the server's
 * `CreatePropertyDto` exactly — the server uses `forbidNonWhitelisted: true`,
 * so any extra field returns `400`.
 */
export interface CreatePropertyDto {
  name: string;
  developer: string;
  location: string;
  imageUrl?: string;
  totalPrice: number;
  downPayment: number;
  startDate: string; // YYYY-MM-DD
  frequency: FrequencyType;
  numberOfInstallments: number;
  installmentAmount: number;
  primaryScheduleLabel?: string;
  extraSchedules?: ExtraScheduleDto[];
}

export interface MarkPaidDto {
  paidDate?: string; // YYYY-MM-DD; defaults to today (UTC) on server
}

export interface PortfolioSummary {
  totalValue: number;
  totalPaid: number;
  totalRemaining: number;
  /** Rounded integer percentage (0–100), not a 0–1 fraction. */
  paidPct: number;
}
