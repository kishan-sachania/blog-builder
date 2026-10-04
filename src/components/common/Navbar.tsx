'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from './Avatar';
import { Feather, BookOpen, PenSquare, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/axios';

interface NavbarProps {
  initialUser?: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ initialUser }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Check session on mount if not provided
    if (initialUser === undefined) {
      apiClient.get('/api/auth/me')
        .then(res => {
          if (res.data?.user) setUser(res.data.user);
        })
        .catch(() => { });
    }
  }, [initialUser]);

  const { post } = useApi();

  const handleLogout = async () => {
    try {
      await post('/api/auth/logout');
      setUser(null);
      setIsDropdownOpen(false);
      router.push('/auth/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FFB22C] flex items-center justify-center text-[#343131] shadow-xs group-hover:bg-[#FF8F00] transition-colors">
                <Feather className="w-5 h-5 text-[#343131]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-none">
                  Blog Builder
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#6B6661] mt-1 font-medium">
                  Editorial Publication
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/"
                className={`transition-colors hover:text-[#FF8F00] ${pathname === '/' ? 'text-[#343131] font-semibold' : 'text-[#6B6661]'
                  }`}
              >
                Stories
              </Link>
              <Link
                href="/topics"
                className={`transition-colors hover:text-[#FF8F00] ${pathname.startsWith('/topics') ? 'text-[#343131] font-semibold' : 'text-[#6B6661]'
                  }`}
              >
                Topics
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Write a story button */}
                <Link
                  href="/studio/new"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write a Story</span>
                </Link>

                {/* Studio link */}
                <Link
                  href="/studio"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-[#343131] hover:text-[#FF8F00] hover:bg-[#F2ECE1] rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Author Studio</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-[#FFB22C] transition-all focus:outline-none"
                    aria-label="User menu"
                  >
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#EAE6DF] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-[#EAE6DF]">
                        <p className="text-xs font-semibold text-[#343131] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#6B6661] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF3E0] text-[#8C5D00]">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        href={`/authors/${user.id}`}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#6B6661]" />
                        <span>Public Author Profile</span>
                      </Link>

                      <Link
                        href="/studio"
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#6B6661]" />
                        <span>Author Studio</span>
                      </Link>

                      <div className="border-t border-[#EAE6DF] my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-[#343131] hover:text-[#FF8F00] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
                >
                  Join the Community
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link
                href="/studio/new"
                className="p-2 rounded-full bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00]"
                aria-label="Write story"
              >
                <PenSquare className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-[#343131] hover:bg-[#F2ECE1] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#EAE6DF] space-y-3">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#343131] hover:bg-[#F2ECE1]"
            >
              Stories
            </Link>
            <Link
              href="/topics"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#343131] hover:bg-[#F2ECE1]"
            >
              Topics & Archives
            </Link>
            <Link
              href="/#about"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#343131] hover:bg-[#F2ECE1]"
            >
              About the Publication
            </Link>

            {user ? (
              <div className="pt-3 border-t border-[#EAE6DF] space-y-2">
                <div className="px-3 py-1 flex items-center space-x-3">
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-[#343131]">{user.name}</p>
                    <p className="text-[11px] text-[#6B6661]">{user.role}</p>
                  </div>
                </div>
                <Link
                  href="/studio"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-[#343131] hover:bg-[#F2ECE1]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Author Studio</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#EAE6DF] flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold border border-[#EAE6DF] text-[#343131]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold bg-[#FFB22C] text-[#343131]"
                >
                  Join the Community
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
