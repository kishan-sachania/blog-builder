import React, { Suspense } from 'react';
import { categoryService } from '@/services/categoryService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ArticleEditor } from '@/components/studio/ArticleEditor';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Write a New Story — Blog Builder Studio',
  description: 'Draft, format, and publish a new essay.',
};

export const dynamic = 'force-dynamic';

export default async function NewStoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const categories = await categoryService.getAllCategories();
  const authorPosts = await postService.getAllPosts({ authorId: user.id });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-white border-r" />}>
        <StudioSidebar user={user} counts={{ total: authorPosts.length }} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        <ArticleEditor categories={categories} />
      </main>
    </div>
  );
}
