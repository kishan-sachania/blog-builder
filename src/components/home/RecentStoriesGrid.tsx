'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Calendar, Eye, Search, ArrowRight, Sparkles, Tag, PenSquare } from 'lucide-react';
import { formatDate } from '@/lib/util';

interface RecentStoriesGridProps {
  posts: Post[];
  categories: Category[];
}

export const RecentStoriesGrid: React.FC<RecentStoriesGridProps> = ({ posts, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Filter published posts
  const filteredPosts = posts.filter(post => {
    if (post.status !== 'published') return false;

    const matchesCategory =
      selectedCategory === 'all' ||
      post.categoryId === selectedCategory ||
      post.categoryName?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    return (
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime()
    );
  });

  // Only display categories that actually have published data
  const publishedPostsCount = posts.filter(p => p.status === 'published').length;
  const categoriesWithPosts = categories
    .map(cat => {
      const count = posts.filter(
        p =>
          p.status === 'published' &&
          (p.categoryId === cat.id ||
            p.categoryId === (cat as any)._id ||
            p.categoryName?.toLowerCase() === cat.name.toLowerCase())
      ).length;
      return { ...cat, postCount: count };
    })
    .filter(cat => cat.postCount > 0);

  return (
    <section id="recent-stories" className="py-14 sm:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EAE6DF]">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Recently Uploaded</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#343131]">
              Recent Stories & Dispatches
            </h2>
            <p className="text-sm text-[#6B6661] mt-1 max-w-2xl">
              The latest published articles, architectural thoughts, and technical notes from across the team.
            </p>
          </div>

          {/* Search bar & Sort dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recent blogs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B] shadow-2xs"
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'latest' | 'popular')}
              className="px-3.5 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer shadow-2xs"
            >
              <option value="latest">Sort: Newest First</option>
              <option value="popular">Sort: Most Read</option>
            </select>
          </div>
        </div>

        {/* Category Pills Navigation (Only categories with published stories) */}
        <div className="flex items-center space-x-2 overflow-x-auto py-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#343131] text-[#FAF8F5] shadow-xs'
                : 'bg-white border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
            }`}
          >
            All Recent Stories ({publishedPostsCount})
          </button>

          {categoriesWithPosts.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id || selectedCategory === cat.name.toLowerCase()
                  ? 'bg-[#343131] text-[#FAF8F5] shadow-xs'
                  : 'bg-white border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
              }`}
            >
              {cat.name} ({cat.postCount})
            </button>
          ))}
        </div>

        {/* Recent Blogs Grid */}
        {sortedPosts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#EAE6DF] my-6 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3E0] flex items-center justify-center text-[#FF8F00] mx-auto mb-4">
              <PenSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#343131]">No stories found</h3>
            <p className="text-sm text-[#6B6661] mt-1 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'No published stories match your current filter. Try clearing your search or switching categories.'
                : 'No published stories have been posted yet. Be the first contributor to share insights with the team.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#EAE6DF] text-[#343131] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Link
                href="/studio/new"
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs"
              >
                Write a Story
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-2">
            {sortedPosts.map(post => {
              const formattedDate = formatDate(post.publishedAt || post.createdAt);

              return (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between bg-white border border-[#EAE6DF] hover:border-[#FFB22C] rounded-2xl p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    {/* Cover image with badge overlays */}
                    <Link
                      href={`/stories/${post.slug}`}
                      className="block relative aspect-16/10 rounded-xl overflow-hidden bg-[#F2ECE1] mb-4"
                    >
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#F2ECE1] p-4 text-center">
                          <span className="font-serif font-bold text-sm text-[#343131] line-clamp-2 px-3">
                            {post.title}
                          </span>
                        </div>
                      )}

                      {/* Top Category Badge */}
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF8F5]/90 text-[#8C5D00] backdrop-blur-md shadow-xs">
                          {post.categoryName}
                        </span>
                      </div>
                    </Link>

                    {/* Meta line */}
                    <div className="flex items-center space-x-2 text-xs text-[#96918B] mb-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formattedDate}
                      </span>
                      {post.viewCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center text-[#96918B]">
                            <Eye className="w-3 h-3 mr-1" />
                            {post.viewCount} views
                          </span>
                        </>
                      )}
                    </div>

                    {/* Headline Title */}
                    <Link href={`/stories/${post.slug}`}>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[#6B6661] mt-2 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center text-[10px] text-[#78716C] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-0.5 rounded-md"
                          >
                            <Tag className="w-2.5 h-2.5 mr-1 text-[#96918B]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Author + Read link */}
                  <div className="mt-5 pt-4 border-t border-[#EAE6DF]/70 flex items-center justify-between">
                    <Link
                      href={`/authors/${post.authorId}`}
                      className="group/author flex items-center space-x-2.5 min-w-0"
                    >
                      <Avatar src={post.authorAvatar} name={post.authorName} size="xs" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-[#343131] group-hover/author:text-[#FF8F00] transition-colors truncate">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-[#96918B] truncate">{post.authorTitle}</p>
                      </div>
                    </Link>

                    <Link
                      href={`/stories/${post.slug}`}
                      className="inline-flex items-center text-xs font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors shrink-0 ml-2"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform text-[#FF8F00]" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
