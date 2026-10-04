import React from 'react';
import Link from 'next/link';
import { Feather, ShieldCheck, HeartHandshake, Lightbulb } from 'lucide-react';

export const MissionSection: React.FC = () => {
  return (
    <section id="about" className="py-20 border-b border-[#EAE6DF] bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB22C]/20 border border-[#FFB22C]/40 flex items-center justify-center mx-auto text-[#FF8F00]">
            <Feather className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#343131] tracking-tight">
            Why We Publish &ldquo;Blog Builder&rdquo;
          </h2>

          <p className="text-base sm:text-lg text-[#6B6661] leading-relaxed font-light">
            In any ambitious enterprise, institutional wisdom is too easily lost in fleeting chat channels, private tickets, and forgotten slide decks. <em>Blog Builder</em> is our collective archive: an intentional editorial medium where any employee can document first principles, synthesize technical decisions, and elevate team culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#FAF3E0] flex items-center justify-center text-[#8C5D00]">
              <Lightbulb className="w-5 h-5 text-[#FF8F00]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#343131]">
              Clarity Through Writing
            </h3>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Writing an essay forces rigorous thinking. By drafting their discoveries publicly, contributors crystalize rationale before implementation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#FAF3E0] flex items-center justify-center text-[#8C5D00]">
              <ShieldCheck className="w-5 h-5 text-[#FF8F00]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#343131]">
              Editorial Stewardship
            </h3>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Our review queue is not a gatekeeper, but a partnership. Editors provide constructive feedback to sharpen storytelling and verify clarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#FAF3E0] flex items-center justify-center text-[#8C5D00]">
              <HeartHandshake className="w-5 h-5 text-[#FF8F00]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#343131]">
              Democratic Authorship
            </h3>
            <p className="text-xs text-[#6B6661] leading-relaxed">
              Every staff member, from newly onboarded apprentices to veteran principal fellows, has equal platform to contribute perspectives.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/studio/new"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
          >
            <span>Contribute to the Archive</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
