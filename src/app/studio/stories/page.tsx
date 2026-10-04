import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { categoryService } from '@/services/categoryService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { StoryTable } from '@/components/studio/StoryTable';
import { PenSquare, Shield } from 'lucide-react';

export const metadata = {
  title: 'All My Stories - Blog Builder Studio',
  description: 'Manage and browse all your authored stories and drafts with search, category/tag filtering, and pagination.',
};

export const dynamic = 'force-dynamic';

export default async function StudioAllStoriesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const [authorPosts, categories] = await Promise.all([
    blogService.getAllPosts({ authorId: user.id }),
    categoryService.getAllCategories(),
  ]);

  const counts = {
    total: authorPosts.length,
    drafts: authorPosts.filter((p) => p.status === 'draft').length,
    published: authorPosts.filter((p) => p.status === 'published').length,
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-white border-r shrink-0" />}>
        <StudioSidebar user={user} counts={{ total: counts.total }} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
              All My Stories
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
              Comprehensive directory of all your authored articles, drafts, and published works.
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#232020] text-[#FFB22C] hover:bg-[#343131] hover:text-white transition-all shadow-xs border border-[#343131]"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB22C]" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              href="/studio/new"
              className="inline-flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
            >
              <PenSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Write a New Story</span>
            </Link>
          </div>
        </div>

        {/* All Stories Table with 10-item pagination, search by name/title, and category/tag/status filters */}
        <StoryTable
          stories={authorPosts}
          categories={categories}
          title="All Authored Stories"
          isOverview={false}
        />
      </main>
    </div>
  );
}
