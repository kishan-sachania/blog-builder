'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import { loginSchema, LoginFormData } from '@/lib/validations';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const { post, loading: isLoading, error } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const resData = await post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      const user = resData?.user;

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/studio');
      }
      router.refresh();
    } catch {
      // Error handled by useApi
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Form header */}
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#343131]">
          Sign in
        </h2>
        <p className="text-xs text-[#6B6661] leading-relaxed">
          Enter your organizational credentials to access your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#343131]">
            Email address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.internal"
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
            <span className="text-[10px] text-[#96918B]">Case-sensitive</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
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

        {/* Remember Me */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-[#EAE6DF] text-[#FF8F00] focus:ring-[#FFB22C]"
          />
          <label htmlFor="rememberMe" className="text-xs text-[#6B6661] cursor-pointer">
            Remember this browser session
          </label>
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
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in to journal</span>
          )}
        </button>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-[#EAE6DF] text-xs text-[#6B6661]">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/auth/register"
            className="font-semibold text-[#FF8F00] hover:text-[#D47400] hover:underline"
          >
            Register for author credentials
          </Link>
        </div>
      </form>
    </div>
  );
};
