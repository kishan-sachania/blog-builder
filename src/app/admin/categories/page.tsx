import React, { Suspense } from 'react';
import { categoryService } from '@/services/categoryService';
import { tagService } from '@/services/tagService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CategoryManager } from '@/components/admin/CategoryManager';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Categories & Channels — Blog Builder Admin',
  description: 'Manage categories, descriptions, and channel tags.',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  const [categories, tags, pendingPosts] = await Promise.all([
    categoryService.getAllCategories(),
    tagService.getAllTags(),
    postService.getAllPosts({ status: 'in_review' }),
  ]);

  return (
    <div className="h-screen bg-[#FAF8F5] flex overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl">
        <CategoryManager categories={categories} initialTags={tags} />
      </main>
    </div>
  );
}
