import React, { Suspense } from 'react';
import { authorService } from '@/services/authorService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AuthorManager } from '@/components/admin/AuthorManager';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Authors & Permissions — Blog Builder Admin',
  description: 'Manage staff author directory and delegate editorial admin rights.',
};

export const dynamic = 'force-dynamic';

export default async function AdminAuthorsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  const authorsWithStats = await authorService.getAllAuthors();
  const pendingPosts = await postService.getAllPosts({ status: 'in_review' });

  return (
    <div className="h-screen bg-[#FAF8F5] flex overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl">
        <AuthorManager authors={authorsWithStats} currentUserId={user.id} />
      </main>
    </div>
  );
}
