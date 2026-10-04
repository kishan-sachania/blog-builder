'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { GenericForm, FormFieldConfig } from '@/components/common/Form';
import { loginSchema, LoginFormData } from '@/lib/validations';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const { post, loading: isLoading, error } = useApi();

  const loginFields: FormFieldConfig<LoginFormData>[] = [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'you@company.internal',
      icon: Mail,
      autoComplete: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••••••',
      icon: Lock,
      badge: 'Case-sensitive',
      autoComplete: 'current-password',
      required: true,
    },
    {
      name: 'rememberMe',
      type: 'checkbox',
      placeholder: 'Remember this browser session',
    },
  ];

  const handleSubmit = async (data: LoginFormData) => {
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
      // Error handled by useApi and displayed via error prop
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

      {/* Generic Form Implementation */}
      <GenericForm<LoginFormData>
        schema={loginSchema}
        fields={loginFields}
        defaultValues={{
          email: '',
          password: '',
          rememberMe: true,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Sign in to journal"
        submitClassName="bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white"
        footer={
          <div className="text-center pt-4 border-t border-[#EAE6DF] text-xs text-[#6B6661]">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/auth/register"
              className="font-semibold text-[#FF8F00] hover:text-[#D47400] hover:underline"
            >
              Register for author credentials
            </Link>
          </div>
        }
      />
    </div>
  );
};
