import React, { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBlogList } from '@/components/admin/AdminBlogList';
import { BookOpen } from 'lucide-react';

import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export const metadata = {
  title: 'All Stories Index — Blog Builder Admin',
  description: 'Manage every employee submission, draft, and published essay across the company.',
};

export const dynamic = 'force-dynamic';

export default async function AdminStoriesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  const { status } = await searchParams;

  return (
    <div className="h-screen bg-[#FAF8F5] flex overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={0} />
      </Suspense>

      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-[#FF8F00] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Archive</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            All Company Stories & Drafts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
            Complete editorial index of all articles authored across every department with live pagination.
          </p>
        </div>

        <AdminBlogList initialStatus={status || 'all'} />
      </main>
    </div>
  );
}
