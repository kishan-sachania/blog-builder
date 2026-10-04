import React, { Suspense } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analyticsService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStats } from '@/components/admin/AdminStats';
import { Shield, BookOpen, Users, ArrowRight } from 'lucide-react';
import { AdminBlogList } from '@/components/admin/AdminBlogList';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Editorial Administration — Blog Builder',
  description: 'Manage platform analytics, users, and published company stories.',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  const analytics = await analyticsService.getAnalytics();

  return (
    <div className="h-screen bg-[#FAF8F5] flex overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} />
      </Suspense>

      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Governance</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
              Platform Telemetry & Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
              Overview of published stories, authors, categories, and editorial metrics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white border border-[#EAE6DF] text-[#343131] hover:bg-[#FAF8F5] transition-all shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Link>

            <Link
              href="/admin/stories"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>All Stories</span>
            </Link>
          </div>
        </div>

        <AdminStats
          totalStories={analytics.totalStories}
          publishedStories={analytics.publishedStories}
          pendingReviews={0}
          activeAuthors={analytics.activeAuthors}
          totalViews={analytics.totalViews}
          draftsCount={analytics.draftsCount}
          mostActiveEmployee={analytics.mostActiveEmployee}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#343131]">
              Recent Platform Stories & Drafts
            </h2>
            <Link
              href="/admin/stories"
              className="text-xs font-semibold text-[#FF8F00] hover:underline flex items-center"
            >
              <span>View full stories index</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <AdminBlogList initialStatus="all" />
        </div>
      </main>
    </div>
  );
}