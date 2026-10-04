import React from 'react';
import Link from 'next/link';
import { PenSquare, Sparkles, ArrowRight, ChevronDown, BookOpen } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] flex flex-col justify-between border-b border-[#EAE6DF] bg-gradient-to-b from-[#FAF8F5] via-[#FAF6F0] to-[#F5EFE6] overflow-hidden">
      {/* Ambient background glow accents */}
      <div
        className="absolute top-1/4 right-5 sm:right-20 w-72 sm:w-96 h-72 sm:h-96 bg-[#FFB22C]/10 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-12 left-5 sm:left-16 w-64 sm:w-80 h-64 sm:h-80 bg-[#FF8F00]/5 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Main Hero Body - Centered Vertically */}
      <div className="flex-1 flex items-center relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl space-y-6 sm:space-y-8">
            {/* Journal Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] border border-[#E8D8BA] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span className="tracking-wider uppercase text-[11px] font-bold">
                The Internal Journal of Record
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#343131] leading-[1.06]">
              Ideas worth <span className="font-serif italic font-normal text-[#FF8F00]">sharing.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#6B6661] font-light leading-relaxed max-w-3xl">
              A collective space where our engineers, designers, and organizational thinkers articulate architecture, deliberate craft, and record institutional lessons.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/studio/new"
                className="inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#343131] text-[#FAF8F5] hover:bg-[#FF8F00] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <PenSquare className="w-4 h-4" />
                <span>Start Writing</span>
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full text-sm font-semibold border border-[#D5CFC5] bg-white/80 backdrop-blur-xs text-[#343131] hover:bg-white hover:border-[#343131]/40 transition-all shadow-xs hover:shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-[#8C5D00]" />
                <span>Explore Archives</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-[#6B6661]" />
              </Link>
            </div>
            
          </div>
        </div>
      </div>

      
    </section>
  );
};
