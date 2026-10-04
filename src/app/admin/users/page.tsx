import React, { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ManageUsers } from '@/components/admin/ManageUsers';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Manage Users & Authors — Blog Builder Admin',
  description: 'Manage users, roles, registration dates, and permissions across the platform.',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  return (
    <div className="h-screen bg-[#FAF8F5] flex overflow-hidden">
      <Suspense fallback={<div className="w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={0} />
      </Suspense>

      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl">
        <ManageUsers />
      </main>
    </div>
  );
}
