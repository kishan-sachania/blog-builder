import React, { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ArrowLeft, Feather, Quote, Sparkles, BookOpen, ShieldCheck, Compass } from 'lucide-react';

export const metadata = {
  title: 'Sign In — The Common Thread',
  description: 'Sign in to access your employee writing studio and editorial tools.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-3 bg-[#FAF8F5]">
      {/* 
        ====================================================
        2:1 RATIO SPLIT
        LEFT PANEL: 2 PARTS (lg:col-span-2) - EDITORIAL SHOWCASE
        RIGHT PANEL: 1 PART (lg:col-span-1) - GENERIC LOGIN FORM
        ====================================================
      */}

      {/* 2 PARTS: Editorial Showcase & Brand Atmosphere (66.7% on desktop) */}
      <section className="lg:col-span-2 relative bg-gradient-to-br from-[#F5EFE6] via-[#FAF8F5] to-[#F1ECE1] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#EAE6DF] overflow-hidden">
        {/* Subtle background ambient graphic */}
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
                The Common Thread
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#6B6661] font-medium mt-1 block">
                Internal Journal of Record
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center space-x-2 text-xs font-semibold text-[#6B6661] hover:text-[#343131] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#EAE6DF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Journal</span>
          </Link>
        </div>

        {/* Center Editorial Manifesto & Featured Essay Pull Quote */}
        <div className="relative z-10 max-w-2xl my-12 lg:my-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] border border-[#FFB22C]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
            <span>Knowledge Archive & Writing Studio</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#343131] leading-[1.18] tracking-tight">
            Where architecture, craft, and collective ideas converge.
          </h1>

          {/* Curated Editorial Quote Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#EAE6DF] shadow-xs space-y-4">
            <Quote className="w-6 h-6 text-[#FF8F00] opacity-80" />
            <blockquote className="font-serif italic text-lg sm:text-xl text-[#343131] leading-relaxed">
              &ldquo;A design system gives you intent. Without shared intent, uniformity is just standardized confusion. Writing forces rigorous clarity before code is deployed.&rdquo;
            </blockquote>
            <div className="flex items-center space-x-3 pt-2 border-t border-[#EAE6DF]/60">
              <div className="w-8 h-8 rounded-full bg-[#FAF3E0] flex items-center justify-center font-serif text-xs font-bold text-[#8C5D00]">
                SC
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#343131]">Sarah Chen</p>
                <p className="text-[#6B6661]">Staff Product Designer • Design Systems</p>
              </div>
            </div>
          </div>

          {/* Publication telemetry highlights */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#343131]">5</span>
              <p className="text-[11px] text-[#6B6661] uppercase tracking-wider font-semibold">Core Disciplines</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#343131]">100%</span>
              <p className="text-[11px] text-[#6B6661] uppercase tracking-wider font-semibold">Staff Authored</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#343131]">Peer</span>
              <p className="text-[11px] text-[#6B6661] uppercase tracking-wider font-semibold">Editorial Review</p>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Standards */}
        <div className="relative z-10 pt-6 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B6661]">
          <p>© {new Date().getFullYear()} The Common Thread. An intentional forum for enterprise craft.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>First Principles</span>
            <span>•</span>
            <span>Clarity Over Jargon</span>
            <span>•</span>
            <span>Democratic Authorship</span>
          </div>
        </div>
      </section>

      {/* 1 PART: Generic Login Form (33.3% on desktop) */}
      <section className="lg:col-span-1 bg-[#FAF8F5] p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        {/* Top mobile back link */}
        <div className="flex items-center justify-between sm:hidden mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B6661]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
          <div className="flex items-center space-x-1 text-xs text-[#FF8F00] font-bold">
            <Feather className="w-4 h-4" />
          </div>
        </div>

        {/* Centered generic login container */}
        <div className="my-auto py-6">
          <Suspense fallback={<div className="text-center text-xs text-[#6B6661]">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom subtle governance badge */}
        <div className="text-center text-[11px] text-[#96918B] pt-4 border-t border-[#EAE6DF]/60">
          Protected workspace. Role-based access configured automatically upon authentication.
        </div>
      </section>
    </div>
  );
}