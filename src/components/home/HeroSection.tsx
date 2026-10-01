import React from 'react';
import Link from 'next/link';
import { PenSquare, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="h-full relative pt-12 pb-14 border-b border-[#EAE6DF] bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5] to-[#F5EFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB22C]/20 text-[#8C5D00] border border-[#FFB22C]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>The Internal Journal of Record</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#343131] leading-[1.12]">
              Ideas worth sharing.
            </h1>

            <p className="text-lg sm:text-xl text-[#6B6661] font-light leading-relaxed max-w-2xl">
              A collective space where our engineers, designers, and organizational thinkers articulate architecture, deliberate craft, and record institutional lessons.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/studio/new"
              className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-full text-sm font-semibold bg-[#343131] text-[#FAF8F5] hover:bg-[#FF8F00] hover:text-white transition-all shadow-sm"
            >
              <PenSquare className="w-4 h-4" />
              <span>Start Writing</span>
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-medium border border-[#D5CFC5] text-[#343131] hover:bg-white transition-all"
            >
              <span>Explore Archives</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
