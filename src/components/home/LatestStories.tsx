'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Clock, Calendar, Eye, Search, ArrowRight, Tag } from 'lucide-react';

interface LatestStoriesProps {
  posts: Post[];
  categories: Category[];
}

export const LatestStories: React.FC<LatestStoriesProps> = ({ posts, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Only published posts for public feed
    if (post.status !== 'published') return false;

    const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EAE6DF]">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#343131]">
              Dispatches & Essays
            </h2>
            <p className="text-sm text-[#6B6661] mt-1">
              Reflections, technical architectural decisions, and working notes from across the organization.
            </p>
          </div>

          {/* Search bar and sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, tags, authors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B]"
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'latest' | 'popular')}
              className="px-3 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer"
            >
              <option value="latest">Sort: Newest First</option>
              <option value="popular">Sort: Most Read</option>
            </select>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto py-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#343131] text-[#FAF8F5]'
                : 'bg-white border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
            }`}
          >
            All Perspectives ({posts.filter(p => p.status === 'published').length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#343131] text-[#FAF8F5]'
                  : 'bg-white border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Article Rows / Feed */}
        {sortedPosts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#EAE6DF] my-6 p-8">
            <h3 className="font-serif text-xl font-medium text-[#343131]">No stories found</h3>
            <p className="text-sm text-[#6B6661] mt-1 max-w-sm mx-auto">
              There are no published stories matching your search or category filter. Try clearing filters or exploring other topics.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]">
            {sortedPosts.map(post => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

              return (
                <article
                  key={post.id}
                  className="group py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start hover:bg-[#FAF8F5]/80 -mx-4 px-4 rounded-xl transition-colors"
                >
                  {/* Article Text Content */}
                  <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3">
                    {/* Meta row: Author & Category */}
                    <div className="flex items-center space-x-3 text-xs text-[#6B6661]">
                      <Link
                        href={`/authors/${post.authorId}`}
                        className="flex items-center space-x-2 font-medium text-[#343131] hover:text-[#FF8F00] transition-colors"
                      >
                        <Avatar src={post.authorAvatar} name={post.authorName} size="xs" />
                        <span>{post.authorName}</span>
                      </Link>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF3E0] text-[#8C5D00]">
                        {post.categoryName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center text-[#96918B]">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Headline */}
                    <Link href={`/stories/${post.slug}`}>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-sm text-[#6B6661] line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Bottom Metadata & Tags */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B6661]">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
                          {post.readingTimeMinutes} min read
                        </span>
                        {post.viewCount > 0 && (
                          <span className="flex items-center">
                            <Eye className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
                            {post.viewCount} views
                          </span>
                        )}
                        <div className="hidden sm:flex items-center space-x-1.5">
                          {post.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center text-[10px] text-[#78716C] bg-white border border-[#EAE6DF] px-2 py-0.5 rounded-full"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1 text-[#96918B]" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link
                        href={`/stories/${post.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-[#343131] group-hover:text-[#FF8F00] transition-colors"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Thumbnail Cover image */}
                  <div className="md:col-span-4 order-first md:order-last">
                    <Link href={`/stories/${post.slug}`} className="block relative aspect-16/10 rounded-xl overflow-hidden bg-[#EAE6DF] border border-[#EAE6DF] shadow-2xs">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                        unoptimized
                      />
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
