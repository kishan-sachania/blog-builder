import React, { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ArrowLeft, Feather, Quote, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Sign In - Blog Builder',
  description: 'Sign in to access your employee writing studio and editorial tools.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#FAF8F5]">
      {/* Left editorial brand panel - hidden on tablet and mobile */}
      <section className="hidden lg:flex lg:col-span-7 relative bg-gradient-to-br from-[#F5EFE6] via-[#FAF8F5] to-[#F1ECE1] p-8 sm:p-12 lg:p-16 flex-col justify-between border-r border-[#EAE6DF] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFB22C]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#FF8F00]/10 blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131] group-hover:bg-[#FF8F00] transition-colors shadow-xs">
              <Feather className="w-5 h-5 text-[#343131]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#343131] block leading-none">
                Blog Builder
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#6B6661] font-medium mt-1 block">
                Internal Journal of Record
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#6B6661] hover:text-[#343131] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#EAE6DF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Journal</span>
          </Link>
        </div>

        {/* Editorial Message */}
        <div className="relative z-10 max-w-xl my-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] border border-[#FFB22C]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
            <span>Staff Writing Studio</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#343131] leading-[1.18] tracking-tight">
            Where architecture, craft, and collective ideas converge.
          </h1>

          <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#EAE6DF] shadow-xs space-y-3">
            <Quote className="w-5 h-5 text-[#FF8F00] opacity-80" />
            <p className="font-serif italic text-base sm:text-lg text-[#343131] leading-relaxed">
              &ldquo;Writing forces rigorous clarity before code is deployed. An intentional forum for enterprise craft.&rdquo;
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-[#EAE6DF] flex items-center justify-between text-xs text-[#6B6661]">
          <p>© {new Date().getFullYear()} Blog Builder</p>
          <span>Staff Contributor & Editorial Portal</span>
        </div>
      </section>

      {/* Right Login Form panel */}
      <section className="col-span-1 lg:col-span-5 bg-[#FAF8F5] p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-screen">
        {/* Mobile & Tablet Top Bar (when left brand panel is hidden) */}
        <div className="flex items-center justify-between lg:hidden mb-6 pb-4 border-b border-[#EAE6DF]">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131] shadow-xs">
              <Feather className="w-4 h-4 text-[#343131]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-[#343131] block leading-none">
                Blog Builder
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#6B6661] font-medium block">
                Editorial Portal
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B6661] hover:text-[#343131] bg-white px-3 py-1.5 rounded-full border border-[#EAE6DF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Journal</span>
          </Link>
        </div>

        <div className="my-auto py-6">
          <Suspense fallback={<div className="text-center text-xs text-[#6B6661]">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Mobile & Tablet subtle footer */}
        <div className="text-center pt-6 text-xs text-[#96918B] lg:hidden">
          <p>© {new Date().getFullYear()} Blog Builder • Staff Sign In</p>
        </div>
      </section>
    </div>
  );
}