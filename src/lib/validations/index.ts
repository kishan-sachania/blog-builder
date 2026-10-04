import { z } from 'zod';

/**
 * Human-readable Zod Validation Schemas
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address (e.g. name@company.com)'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your full name')
    .min(2, 'Name must be at least 2 characters long')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z
    .string()
    .min(1, 'Please enter your corporate email address')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Please create a secure password')
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  bio: z
    .string()
    .max(500, 'Biography cannot exceed 500 characters')
    .optional()
    .default(''),
  avatarUrl: z
    .string()
    .url('Please provide a valid image URL')
    .or(z.literal(''))
    .optional()
    .default(''),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter the user’s full name')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Please enter an email address')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Please provide an initial password')
    .min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['employee', 'admin'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter a category name')
    .min(2, 'Category name must be at least 2 characters long')
    .max(50, 'Category name cannot exceed 50 characters'),
  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional()
    .default(''),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
