import React, { Suspense } from 'react';
import { categoryService } from '@/services/categoryService';
import { tagService } from '@/services/tagService';
import { blogService } from '@/services/blogService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Categories & Channels - Blog Builder Admin',
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
    blogService.getAllPosts({ status: 'in_review' }),
  ]);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
        <CategoryManager categories={categories} initialTags={tags} />
      </main>
    </div>
  );
}
