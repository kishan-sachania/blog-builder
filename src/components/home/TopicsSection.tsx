import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ArrowRight, Compass } from 'lucide-react';

interface TopicsSectionProps {
  categories: (Category & { postCount: number })[];
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ categories }) => {
  return (
    <section className="py-16 bg-[#F4EFE6] border-y border-[#EAE6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#FF8F00] font-bold mb-2">
              <Compass className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Curated Channels</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#343131]">
              Explore by Core Discipline
            </h2>
            <p className="text-sm text-[#6B6661] mt-1">
              Browse deep archives grouped by domain craft and organizational pillars.
            </p>
          </div>

          <Link
            href="/topics"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#343131] hover:text-[#FF8F00] transition-colors"
          >
            <span>All Topics Index</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/topics/${category.slug}`}
              className="group p-6 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#FFB22C] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || '#FF8F00' }}
                  />
                  <span className="text-xs font-semibold text-[#8C5D00] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full">
                    {category.postCount} {category.postCount === 1 ? 'essay' : 'essays'}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors">
                  {category.name}
                </h3>

                <p className="text-xs text-[#6B6661] mt-2 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAE6DF]/60 flex items-center justify-between text-xs font-semibold text-[#343131]">
                <span>Browse Stories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#FF8F00]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
