import React, { Suspense } from 'react';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ProfileEditor } from '@/components/studio/ProfileEditor';

export const metadata = {
  title: 'Author Profile Settings — The Common Thread Studio',
  description: 'Manage your public author bio, avatar, and publication credentials.',
};

export const dynamic = 'force-dynamic';

export default async function StudioProfilePage() {
  const user = await getCurrentUser() || {
    id: 'guest',
    name: 'Author',
    email: 'author@commonthread.internal',
    passwordHash: '',
    role: 'employee',
    title: 'Staff Contributor',
    department: 'Editorial',
    avatarUrl: '',
    bio: '',
    joinedDate: '2024',
    createdAt: ''
  };

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

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-4xl overflow-y-auto">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            Author Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
            Your name, role, and bio appear alongside your published essays across the journal.
          </p>
        </div>

        <ProfileEditor user={user} />
      </main>
    </div>
  );
}
