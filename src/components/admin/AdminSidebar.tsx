'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Shield,
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  ExternalLink,
  LogOut,
  PenSquare,
  Menu,
  X
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface AdminSidebarProps {
  user: User;
  pendingReviewsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { post } = useApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await post('/api/auth/logout');
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
      label: 'Manage Users',
      href: '/admin/users',
      icon: Users,
      isActive: pathname === '/admin/users'
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
    }
  ];

  const sidebarContent = (
    <>
      <div className="p-5 space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131]">
              <Shield className="w-4 h-4 text-[#343131]" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#FAF8F5] block leading-tight">
                Blog Builder
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#FFB22C] font-semibold">
                Editorial Board Admin
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-[#C7C2BA] hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${item.isActive
                    ? 'bg-[#FFB22C] text-[#343131] font-bold'
                    : 'text-[#C7C2BA] hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
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
            className="flex items-center space-x-1 text-[#96918B] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Log out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-30 bg-[#232020] text-[#FAF8F5] border-b border-[#343131] px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131]">
            <Shield className="w-3.5 h-3.5 text-[#343131]" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-[#FAF8F5] block leading-tight">
              Blog Builder
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#FFB22C] font-semibold block leading-none">
              Admin
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/studio"
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-[#FAF8F5] hover:bg-white/20"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Studio</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-[#343131] text-[#FAF8F5] hover:bg-white/5"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#232020] text-[#FAF8F5] shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200 border-r border-[#343131]">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#232020] text-[#FAF8F5] h-screen sticky top-0 flex-col justify-between shrink-0 overflow-y-auto border-r border-[#343131]">
        {sidebarContent}
      </aside>
    </>
  );
};
