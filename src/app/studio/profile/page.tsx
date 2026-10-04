import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { getCurrentUser } from '@/lib/auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { ProfileEditor } from '@/components/studio/ProfileEditor';

export const metadata = {
  title: 'Author Profile Settings - Blog Builder Studio',
  description: 'Manage your public author bio, avatar, and publication credentials.',
};

export const dynamic = 'force-dynamic';

export default async function StudioProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const authorPosts = await blogService.getAllPosts({ authorId: user.id });

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-white border-r shrink-0" />}>
        <StudioSidebar user={user} counts={{ total: authorPosts.length }} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
            Author Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
            Your name appears alongside your published essays across the journal.
          </p>
        </div>

        <ProfileEditor user={user} />
      </main>
    </div>
  );
}
