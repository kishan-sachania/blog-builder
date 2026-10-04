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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-white border-r shrink-0" />}>
        <StudioSidebar user={user} counts={{ total: authorPosts.length }} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
        <ArticleEditor
          initialPost={post}
          categories={categories}
          isEditing={true}
        />
      </main>
    </div>
  );
}
