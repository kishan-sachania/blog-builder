import React, { Suspense } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analyticsService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStats } from '@/components/admin/AdminStats';
import { ModerationQueue } from '@/components/admin/ModerationQueue';
import { Clock, Shield, ArrowRight, Activity } from 'lucide-react';

export const metadata = {
  title: 'Editorial Administration — The Common Thread',
  description: 'Manage platform analytics, moderation review queues, and publishing channels.',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
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

  const analytics = await analyticsService.getAnalytics();
  const pendingPosts = await postService.getAllPosts({ status: 'in_review' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      <Suspense fallback={<div className="w-64 bg-[#232020]" />}>
        <AdminSidebar user={user} pendingReviewsCount={pendingPosts.length} />
      </Suspense>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Editorial Governance Control</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
              Platform Telemetry & Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6661] mt-0.5">
              Review platform health, manage publishing queues, and oversee author contributions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/moderation"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
            >
              <Clock className="w-4 h-4" />
              <span>Review Queue ({analytics.pendingReviews})</span>
            </Link>
          </div>
        </div>

        <AdminStats
          totalStories={analytics.totalStories}
          publishedStories={analytics.publishedStories}
          pendingReviews={analytics.pendingReviews}
          activeAuthors={analytics.activeAuthors}
          totalViews={analytics.totalViews}
          draftsCount={analytics.draftsCount}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#343131]">
              Priority Review Submissions
            </h2>
            <Link
              href="/admin/moderation"
              className="text-xs font-semibold text-[#FF8F00] hover:underline flex items-center"
            >
              <span>View full queue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <ModerationQueue pendingPosts={pendingPosts} />
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#FF8F00]" />
            <h2 className="font-serif text-xl font-bold text-[#343131]">
              Recent Editorial Moderation Logs
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
            {analytics.recentLogs.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#96918B] italic">No moderation actions recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
                  <tr>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Story Title</th>
                    <th className="px-4 py-3.5">Reviewer</th>
                    <th className="px-5 py-3.5">Notes</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6DF]">
                  {analytics.recentLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#343131]">
                        {log.postTitle}
                      </td>
                      <td className="px-4 py-3.5 text-[#6B6661]">
                        {log.reviewerName}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B6661]">
                        {log.notes || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[#96918B] text-[11px]">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}