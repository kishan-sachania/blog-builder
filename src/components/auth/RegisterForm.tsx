'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { GenericForm, FormFieldConfig } from '@/components/common/Form';
import { registerSchema, RegisterFormData } from '@/lib/validations';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { post, loading: isLoading, error } = useApi();

  const registerFields: FormFieldConfig<RegisterFormData>[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'e.g. Julian Hayes',
      icon: UserIcon,
      autoComplete: 'name',
      required: true,
    },
    {
      name: 'email',
      label: 'Corporate Email',
      type: 'email',
      placeholder: 'julian.hayes@company.internal',
      icon: Mail,
      autoComplete: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'At least 6 characters',
      icon: Lock,
      badge: 'Min 6 characters',
      autoComplete: 'new-password',
      required: true,
    },
  ];

  const handleSubmit = async (data: RegisterFormData) => {
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

        <GenericForm<RegisterFormData>
          schema={registerSchema}
          fields={registerFields}
          defaultValues={{
            name: '',
            email: '',
            password: '',
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          submitText="Complete Registration"
          submitClassName="bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white"
          footer={
            <div className="text-center pt-2 border-t border-[#EAE6DF] text-xs text-[#6B6661]">
              <span>Already registered? </span>
              <Link
                href="/auth/login"
                className="font-semibold text-[#FF8F00] hover:underline"
              >
                Sign in to existing account
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default RegisterForm;
