'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, Lock, Mail, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import { registerSchema, RegisterFormData } from '@/lib/validations';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { post, loading: isLoading, error } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await post('/api/auth/register', data);
      router.push('/studio');
      router.refresh();
    } catch {
      // Error handled by useApi
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EAE6DF] shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FFB22C] flex items-center justify-center mx-auto text-[#343131] shadow-xs">
            <Feather className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            Create Account
          </h2>
          <p className="text-xs text-[#6B6661]">
            Enter your details to create your employee contributor profile
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#343131]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoComplete="name"
                placeholder="e.g. Julian Hayes"
                {...register('name')}
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                  errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#343131]">
              Corporate Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder="julian.hayes@company.internal"
                {...register('email')}
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                  errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#343131]">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-[#96918B]">Min 6 characters</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                {...register('password')}
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                  errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-[#EAE6DF] text-xs text-[#6B6661]">
            <span>Already registered? </span>
            <Link
              href="/auth/login"
              className="font-semibold text-[#FF8F00] hover:underline"
            >
              Sign in to existing account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
