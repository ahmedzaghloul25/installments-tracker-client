export type PaymentStatus = 'paid' | 'upcoming' | 'pending';
export type FrequencyType = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type PaymentType = 'installment' | 'maintenance' | 'receipt';

export interface Installment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
  paymentType?: PaymentType;
  scheduleId?: string;
}

export interface PaymentSchedule {
  id: string;
  label: string;
  paymentType: PaymentType;
  frequency: FrequencyType;
  startDate: string;
  count: number;
  amount: number;
  installments: Installment[];
}

export interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  imageUrl?: string;
  totalPrice: number;
  downPayment: number;
  startDate: string;
  frequency: FrequencyType;
  numberOfInstallments: number;
  installments: Installment[];
  schedules?: PaymentSchedule[];
  paidAmount: number;
  paidPercentage: number;
  nextDueDate: string;
  nextDueAmount: number;
  installmentAmount: number;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  biometricEnabled: boolean;
}
