// src/utils/validation.ts
import { z } from 'zod';

// User schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_merchant: z.boolean(),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// Payment plan schemas
export const createPlanSchema = z.object({
  total_amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  start_date: z.string().min(1, 'Start date is required'),
  installments: z
    .number()
    .int('Must be a whole number')
    .min(1, 'At least 1 installment required')
    .max(48, 'Maximum 48 installments allowed'),
  customer_email: z.string().email('Invalid email address'),
});

// Parse and validate functions
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

export function validateCreatePlan(data: unknown) {
  return createPlanSchema.safeParse(data);
}
