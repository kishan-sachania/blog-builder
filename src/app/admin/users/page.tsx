import React, { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ManageUsers } from '@/components/admin/ManageUsers';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Manage Users & Authors - Blog Builder Admin',
  description: 'Manage users, roles, registration dates, and permissions across the platform.',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(user ? '/studio' : '/auth/login');
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      <Suspense fallback={<div className="hidden md:block w-64 bg-[#232020] h-screen shrink-0" />}>
        <AdminSidebar user={user} pendingReviewsCount={0} />
      </Suspense>

      <main className="flex-1 md:h-screen md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
        <ManageUsers />
      </main>
    </div>
  );
}
