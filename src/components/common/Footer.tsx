import React from 'react';
import Link from 'next/link';
import { Feather, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#F4EFE6] border-t border-[#EAE6DF] text-[#343131]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131]">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#343131]">
                The Common Thread
              </span>
            </div>
            <p className="text-sm text-[#6B6661] max-w-md leading-relaxed">
              An intentional publishing forum for employees, architects, leaders, and creators. We articulate the ideas, technical architectures, and cultural decisions shaping our craft.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-[#6B6661]">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EAE6DF] text-[#343131] font-medium">
                Internal Journal
              </span>
              <span>•</span>
              <span>Updated Weekly</span>
            </div>
          </div>

          {/* Editorial Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B6661]">
              Publication
            </h4>
            <ul className="space-y-2 text-sm text-[#343131]">
              <li>
                <Link href="/" className="hover:text-[#FF8F00] transition-colors">
                  Featured Stories
                </Link>
              </li>
              <li>
                <Link href="/topics" className="hover:text-[#FF8F00] transition-colors">
                  Explore Topics & Archives
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-[#FF8F00] transition-colors">
                  Author Writing Studio
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#FF8F00] transition-colors">
                  Editorial Moderation Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Principles Column */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B6661]">
              Editorial Standards
            </h4>
            <ul className="space-y-2 text-sm text-[#343131]">
              <li>
                <span className="text-[#6B6661]">Clarity over jargon</span>
              </li>
              <li>
                <span className="text-[#6B6661]">First principles documentation</span>
              </li>
              <li>
                <span className="text-[#6B6661]">Constructive discourse</span>
              </li>
              <li>
                <Link href="/auth/login" className="inline-flex items-center text-xs font-semibold text-[#FF8F00] hover:underline mt-2">
                  Staff Login <ArrowUpRight className="w-3 h-3 ml-1" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EAE6DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6661] gap-4">
          <p>© {new Date().getFullYear()} The Common Thread. Designed for internal company discourse.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#343131]">Privacy & Confidentiality</span>
            <span>•</span>
            <span className="hover:text-[#343131]">Writing Guidelines</span>
            <span>•</span>
            <span className="hover:text-[#343131]">Editorial Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
