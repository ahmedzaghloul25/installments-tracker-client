import { request } from './client';
import type {
  CreatePropertyDto,
  LoginResponse,
  MarkPaidDto,
  PortfolioSummary,
  SignupRequest,
} from './types';
import type { Property, User } from '../types/models';

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('POST', '/auth/login', { email, password }),
  signup: (dto: SignupRequest) => request<User>('POST', '/auth/signup', dto),
  logout: () => request<void>('POST', '/auth/logout'),
};

export const propertiesApi = {
  list: () => request<Property[]>('GET', '/properties'),
  create: (dto: CreatePropertyDto) => request<Property>('POST', '/properties', dto),
  markInstallmentPaid: (pid: string, iid: string, paidDate?: string) => {
    const body: MarkPaidDto | undefined = paidDate ? { paidDate } : undefined;
    return request<Property>('PATCH', `/properties/${pid}/installments/${iid}`, body);
  },
};

export const portfolioApi = {
  summary: () => request<PortfolioSummary>('GET', '/portfolio/summary'),
};
