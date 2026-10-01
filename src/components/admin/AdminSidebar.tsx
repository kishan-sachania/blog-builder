'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Shield,
  LayoutDashboard,
  Clock,
  BookOpen,
  Users,
  FolderTree,
  ExternalLink,
  LogOut,
  PenSquare,
  Feather
} from 'lucide-react';

interface AdminSidebarProps {
  user: User;
  pendingReviewsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  pendingReviewsCount = 0
}) => {
  const pathname = usePathname();
  const router = useRouter();

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
      label: 'Overview & Telemetry',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin'
    },
    {
      label: 'Review Queue',
      href: '/admin/moderation',
      icon: Clock,
      count: pendingReviewsCount,
      isActive: pathname === '/admin/moderation',
      highlightCount: true
    },
    {
      label: 'All Stories Index',
      href: '/admin/stories',
      icon: BookOpen,
      isActive: pathname === '/admin/stories'
    },
    {
      label: 'Categories & Channels',
      href: '/admin/categories',
      icon: FolderTree,
      isActive: pathname === '/admin/categories'
    },
    {
      label: 'Authors & Governance',
      href: '/admin/authors',
      icon: Users,
      isActive: pathname === '/admin/authors'
    }
  ];

  return (
    <aside className="w-64 bg-[#232020] text-[#FAF8F5] min-h-screen flex flex-col justify-between shrink-0">
      <div className="p-5 space-y-6">
        {/* Brand header */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131]">
            <Shield className="w-4 h-4 text-[#343131]" />
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#FAF8F5] block leading-tight">
              The Common Thread
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#FFB22C] font-semibold">
              Editorial Board Admin
            </span>
          </div>
        </Link>

        {/* Quick action to Author Studio */}
        <Link
          href="/studio"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-[#FFB22C] hover:text-[#343131] text-[#FAF8F5] transition-all"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>Go to Author Studio</span>
        </Link>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.isActive
                    ? 'bg-[#FFB22C] text-[#343131] font-bold'
                    : 'text-[#C7C2BA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isActive
                        ? 'bg-[#343131] text-[#FAF8F5]'
                        : 'bg-[#FF8F00] text-white animate-pulse'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#1B1919]">
        <div className="flex items-center space-x-3">
          <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-[#FFB22C] truncate">Editor-in-Chief / Admin</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center space-x-1 text-[#A8A29E] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">Public Blog</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
