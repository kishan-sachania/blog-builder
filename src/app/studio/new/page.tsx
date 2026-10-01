import React, { Suspense } from 'react';
import { categoryService } from '@/services/categoryService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ArticleEditor } from '@/components/studio/ArticleEditor';

export const metadata = {
  title: 'Write a New Story — The Common Thread Studio',
  description: 'Draft, format, and submit a new essay for editorial review.',
};

export const dynamic = 'force-dynamic';

export default async function NewStoryPage() {
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

  const categories = await categoryService.getAllCategories();
  const authorPosts = await postService.getAllPosts({ authorId: user.id });

  const counts = {
    total: authorPosts.length,
    drafts: authorPosts.filter(p => p.status === 'draft').length,
    inReview: authorPosts.filter(p => p.status === 'in_review').length,
    published: authorPosts.filter(p => p.status === 'published').length,
    rejected: authorPosts.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-white border-r" />}>
        <StudioSidebar user={user} counts={counts} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        <ArticleEditor categories={categories} />
      </main>
    </div>
  );
}
