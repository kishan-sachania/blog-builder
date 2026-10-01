import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { postService } from '@/services/postService';
import { categoryService } from '@/services/categoryService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ArticleEditor } from '@/components/studio/ArticleEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Story — The Common Thread Studio',
  description: 'Modify drafts or revise essays based on editorial review notes.',
};

export const dynamic = 'force-dynamic';

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params;
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

  const post = await postService.getPostById(id);
  if (!post) {
    notFound();
  }

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
        <ArticleEditor
          initialPost={post}
          categories={categories}
          isEditing={true}
        />
      </main>
    </div>
  );
}
