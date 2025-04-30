import { PaymentStatus } from '../utils/constants';

export interface User {
  id: number;
  username: string;
  email: string;
  isMerchant: boolean;
}

export interface Installment {
  id: number;
  sequence: number;
  due_date: string;
  amount: string;
  status: PaymentStatus;
  paid_at?: string;
}

export interface PaymentPlan {
  id: number;
  total_amount: string;
  status: PaymentStatus;
  start_date: string;
  customer?: User;
  merchant?: User;
  installments: Installment[];
  total_installments: number;
  paid_installments: number;
}

export interface CreatePlanRequest {
  total_amount: string;
  start_date: string;
  installments: number;
  customer_email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_merchant: boolean;
}
export { PaymentStatus };
