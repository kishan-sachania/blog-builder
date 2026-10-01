'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const user = response.data?.data?.user;

      // Redirect dynamically based on user role or callback
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/studio');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
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

      {/* Error notification */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Generic Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#343131] mb-1.5" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.internal"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EAE6DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#343131]" htmlFor="password">
              Password
            </label>
            <span className="text-[11px] text-[#96918B]">
              Case-sensitive
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EAE6DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-[#6B6661]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#FF8F00] focus:ring-[#FFB22C] border-[#EAE6DF] accent-[#FF8F00]"
            />
            <span className="text-[11px]">Remember this browser</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign in to journal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer link to register */}
      <div className="text-center pt-4 border-t border-[#EAE6DF] text-xs text-[#6B6661]">
        <span>Don&apos;t have an account? </span>
        <Link href="/auth/register" className="font-semibold text-[#FF8F00] hover:text-[#D47400] hover:underline">
          Register for author credentials
        </Link>
      </div>
    </div>
  );
};
