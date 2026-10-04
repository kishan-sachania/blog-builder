import React from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { ArrowRight, BookOpen } from 'lucide-react';

interface AuthorBioCardProps {
  author: User;
}

export const AuthorBioCard: React.FC<AuthorBioCardProps> = ({ author }) => {
  return (
    <div className="max-w-3xl mx-auto my-12 p-8 rounded-2xl bg-[#F4EFE6] border border-[#EAE6DF]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Link href={`/authors/${author.id}`} className="shrink-0">
          <Avatar src={author.avatarUrl} name={author.name} size="xl" />
        </Link>

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C5D00] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full">
                Contributing Author
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#343131] mt-1">
                <Link href={`/authors/${author.id}`} className="hover:text-[#FF8F00] transition-colors">
                  {author.name}
                </Link>
              </h3>
              <p className="text-xs text-[#6B6661]">
                {author.title} • {author.department}
              </p>
            </div>

            <Link
              href={`/authors/${author.id}`}
              className="inline-flex items-center text-xs font-semibold text-[#FF8F00] hover:text-[#D47400] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span>View All Essays</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <p className="text-sm text-[#44403c] leading-relaxed">
            {author.bio || 'Staff author at Blog Builder, publishing technical findings and organizational reflections.'}
          </p>
        </div>
      </div>
    </div>
  );
};
