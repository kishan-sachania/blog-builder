import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { categoryService } from '@/services/categoryService';
import { blogService } from '@/services/blogService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ArticleEditor } from '@/components/studio/ArticleEditor';

export const metadata = {
  title: 'Write a New Story - Blog Builder Studio',
  description: 'Draft, format, and publish a new essay.',
};

export const dynamic = 'force-dynamic';

export default async function NewStoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const categories = await categoryService.getAllCategories();
  const authorPosts = await blogService.getAllPosts({ authorId: user.id });

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-white border-r shrink-0" />}>
        <StudioSidebar user={user} counts={{ total: authorPosts.length }} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
        <ArticleEditor categories={categories} />
      </main>
    </div>
  );
}
