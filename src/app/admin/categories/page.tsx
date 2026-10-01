import React, { Suspense } from 'react';
import { categoryService } from '@/services/categoryService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const metadata = {
  title: 'Categories & Channels — The Common Thread Admin',
  description: 'Manage categories, descriptions, and channel tags.',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser() || {
    id: 'admin',
    name: 'Administrator',
    email: 'admin@commonthread.internal',
    passwordHash: '',
    role: 'admin',
    title: 'Editor-in-Chief',
    department: 'Editorial Board',
    avatarUrl: '',
    bio: '',
    joinedDate: '2024',
    createdAt: ''
  };

  const categories = await categoryService.getAllCategories();
  const pendingPosts = await postService.getAllPosts({ status: 'in_review' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-[#232020]" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
        <CategoryManager categories={categories} />
      </main>
    </div>
  );
}
