import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ArrowLeft, Feather } from 'lucide-react';

export const metadata = {
  title: 'Join The Common Thread — Register Author Account',
  description: 'Register as an employee contributor to author essays and participate in editorial discussions.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top back navigation */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#6B6661] hover:text-[#343131] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Publication</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs text-[#6B6661]">
          <Feather className="w-4 h-4 text-[#FF8F00]" />
          <span className="font-serif font-bold text-[#343131]">The Common Thread</span>
        </div>
      </div>

      {/* Main Register Card */}
      <div className="my-auto py-8">
        <RegisterForm />
      </div>

      <div className="max-w-md mx-auto text-center text-[11px] text-[#96918B] pb-4">
        Authors retain intellectual ownership of company whitepapers and essays.
      </div>
    </div>
  );
}
