import React, { Suspense } from 'react';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StoryTable } from '@/components/studio/StoryTable';
import { BookOpen } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export const metadata = {
  title: 'All Stories Index — The Common Thread Admin',
  description: 'Manage every employee submission, draft, and published essay across the company.',
};

export const dynamic = 'force-dynamic';

export default async function AdminStoriesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser() || {
    id: 'admin',
    name: 'Administrator',
    email: 'admin@commonthread.internal',
    passwordHash: '',
    role: 'admin',
    title: 'Editor-in-Chief',
    department: 'Editorial Board',
    avatarUrl: '',
    bio: '',
    joinedDate: '2024',
    createdAt: ''
  };

  const { status } = await searchParams;
  const allPosts = await postService.getAllPosts({ status: status || undefined });
  const pendingPosts = await postService.getAllPosts({ status: 'in_review' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-[#232020]" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-[#FF8F00] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Archive</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            All Company Stories & Drafts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
            Complete editorial index of all articles authored across every department.
          </p>
        </div>

        <StoryTable
          stories={allPosts}
          title="All Stories Directory"
        />
      </main>
    </div>
  );
}
