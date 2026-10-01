import React, { Suspense } from 'react';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ModerationQueue } from '@/components/admin/ModerationQueue';
import { Clock } from 'lucide-react';

export const metadata = {
  title: 'Editorial Review Queue — The Common Thread Admin',
  description: 'Review pending submissions, provide feedback, approve, and manage article publishing.',
};

export const dynamic = 'force-dynamic';

export default async function AdminModerationPage() {
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

  const pendingPosts = await postService.getAllPosts({ status: 'in_review' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-[#232020]" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-[#FF8F00] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Submission Pipeline</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            Editorial Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
            Review incoming drafts from employees, offer feedback, request revisions, or approve for publication.
          </p>
        </div>

        <ModerationQueue pendingPosts={pendingPosts} />
      </main>
    </div>
  );
}
