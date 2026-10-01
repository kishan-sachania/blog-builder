'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Feather,
  LayoutDashboard,
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  PenSquare,
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';

interface StudioSidebarProps {
  user: User;
  counts?: {
    total: number;
    drafts: number;
    inReview: number;
    published: number;
    rejected: number;
  };
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ user, counts }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'all';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    {
      label: 'Studio Overview',
      href: '/studio',
      icon: LayoutDashboard,
      isActive: pathname === '/studio' && !searchParams.get('tab')
    },
    {
      label: 'All My Stories',
      href: '/studio?tab=all',
      icon: FileText,
      count: counts?.total,
      isActive: pathname === '/studio' && currentTab === 'all' && !!searchParams.get('tab')
    },
    {
      label: 'Drafts',
      href: '/studio?tab=draft',
      icon: FileEdit,
      count: counts?.drafts,
      isActive: pathname === '/studio' && currentTab === 'draft'
    },
    {
      label: 'In Editorial Review',
      href: '/studio?tab=in_review',
      icon: Clock,
      count: counts?.inReview,
      isActive: pathname === '/studio' && currentTab === 'in_review'
    },
    {
      label: 'Published Essays',
      href: '/studio?tab=published',
      icon: CheckCircle2,
      count: counts?.published,
      isActive: pathname === '/studio' && currentTab === 'published'
    },
    {
      label: 'Needs Revision',
      href: '/studio?tab=rejected',
      icon: AlertCircle,
      count: counts?.rejected,
      isActive: pathname === '/studio' && currentTab === 'rejected'
    },
    {
      label: 'Author Profile',
      href: '/studio/profile',
      icon: UserIcon,
      isActive: pathname === '/studio/profile'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#EAE6DF] min-h-screen flex flex-col justify-between shrink-0">
      <div className="p-5 space-y-6">
        {/* Brand header */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131] group-hover:bg-[#FF8F00] transition-colors">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#343131] block leading-tight">
              The Common Thread
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6661] font-semibold">
              Writing Studio
            </span>
          </div>
        </Link>

        {/* Primary Action */}
        <Link
          href="/studio/new"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
        >
          <PenSquare className="w-4 h-4" />
          <span>Write a New Story</span>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.isActive
                    ? 'bg-[#FAF3E0] text-[#8C5D00] font-semibold'
                    : 'text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    item.isActive ? 'bg-[#FFB22C]/40 text-[#8C5D00]' : 'bg-[#FAF8F5] text-[#96918B]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin shortcut if applicable */}
        {user.role === 'admin' && (
          <div className="pt-2 border-t border-[#EAE6DF]">
            <Link
              href="/admin"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <Shield className="w-4 h-4 text-[#FF8F00]" />
              <span>Admin Moderation Panel</span>
            </Link>
          </div>
        )}
      </div>

      {/* User Card & Footer */}
      <div className="p-4 border-t border-[#EAE6DF] space-y-3 bg-[#FAF8F5]">
        <div className="flex items-center space-x-3">
          <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#343131] truncate">{user.name}</p>
            <p className="text-[10px] text-[#6B6661] truncate">{user.title}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            href="/"
            className="flex items-center space-x-1 text-[#6B6661] hover:text-[#343131] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">View Journal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
