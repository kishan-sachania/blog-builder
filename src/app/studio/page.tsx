import React, { Suspense } from 'react';
import Link from 'next/link';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { StudioStats } from '@/components/studio/StudioStats';
import { StoryTable } from '@/components/studio/StoryTable';
import { PenSquare } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export const metadata = {
  title: 'Author Studio — The Common Thread',
  description: 'Manage your drafts, submissions, and published essays.',
};

export const dynamic = 'force-dynamic';

export default async function StudioPage({ searchParams }: PageProps) {
  const user = await getCurrentUser() || {
    id: 'guest',
    name: 'Author',
    email: '',
    passwordHash: '',
    role: 'employee',
    title: 'Staff Contributor',
    department: 'Editorial',
    avatarUrl: '',
    bio: '',
    joinedDate: '',
    createdAt: ''
  };

  const { tab = 'all' } = await searchParams;
  const authorPosts = await postService.getAllPosts({ authorId: user.id });

  const counts = {
    total: authorPosts.length,
    drafts: authorPosts.filter(p => p.status === 'draft').length,
    inReview: authorPosts.filter(p => p.status === 'in_review').length,
    published: authorPosts.filter(p => p.status === 'published').length,
    rejected: authorPosts.filter(p => p.status === 'rejected').length,
    views: authorPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0)
  };

  let filteredStories = authorPosts;
  if (tab !== 'all') {
    filteredStories = authorPosts.filter(p => p.status === tab);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-white border-r" />}>
        <StudioSidebar user={user} counts={counts} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
              Author Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
              Welcome to your writing studio. Manage drafts and track editorial submissions.
            </p>
          </div>

          <Link
            href="/studio/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs shrink-0"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write a New Story</span>
          </Link>
        </div>

        <div className="mb-8">
          <StudioStats
            total={counts.total}
            published={counts.published}
            inReview={counts.inReview}
            drafts={counts.drafts}
            views={counts.views}
          />
        </div>

        <StoryTable
          stories={filteredStories}
          title="My Stories"
        />
      </main>
    </div>
  );
}
