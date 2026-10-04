import React, { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { categoryService } from '@/services/categoryService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ArticleEditor } from '@/components/studio/ArticleEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Story - Blog Builder Studio',
  description: 'Modify drafts or update your published essays.',
};

export const dynamic = 'force-dynamic';

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const post = await blogService.getPostById(id);
  if (!post) {
    notFound();
  }

  const categories = await categoryService.getAllCategories();
  const authorPosts = await blogService.getAllPosts({ authorId: user.id });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-white border-r" />}>
        <StudioSidebar user={user} counts={{ total: authorPosts.length }} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        <ArticleEditor
          initialPost={post}
          categories={categories}
          isEditing={true}
        />
      </main>
    </div>
  );
}
