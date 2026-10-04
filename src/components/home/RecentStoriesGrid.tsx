'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Post, Category } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Calendar,
  Eye,
  Search,
  ArrowRight,
  Sparkles,
  Tag as TagIcon,
  PenSquare,
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Folder,
} from 'lucide-react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { formatDate } from '@/lib/util';

interface RecentStoriesGridProps {
  posts: Post[];
  categories: Category[];
}

const RecentStoriesGridInner: React.FC<RecentStoriesGridProps> = ({ posts, categories }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial query params
  const initialCategory = searchParams.get('category') || 'all';
  const initialTag = searchParams.get('tag') || 'all';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as 'latest' | 'popular' | 'oldest') || 'latest';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>(initialSort);

  // Sync state if URL changes externally
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const tg = searchParams.get('tag') || 'all';
    const q = searchParams.get('search') || searchParams.get('q') || '';
    const s = (searchParams.get('sort') as 'latest' | 'popular' | 'oldest') || 'latest';

    setSelectedCategory(cat);
    setSelectedTag(tg);
    setSearchQuery(q);
    setSortBy(s);
  }, [searchParams]);

  // Update URL search parameters without triggering a full page reload
  const updateQueryParams = useCallback(
    (newCat: string, newTag: string, newSearch: string, newSort: string) => {
      const params = new URLSearchParams();

      if (newCat && newCat !== 'all') params.set('category', newCat);
      if (newTag && newTag !== 'all') params.set('tag', newTag);
      if (newSearch.trim()) params.set('search', newSearch.trim());
      if (newSort && newSort !== 'latest') params.set('sort', newSort);

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}#recent-stories` : `${pathname}#recent-stories`;
      window.history.replaceState(null, '', newUrl);
    },
    [pathname]
  );

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    updateQueryParams(catId, selectedTag, searchQuery, sortBy);
  };

  const handleTagChange = (tagName: string) => {
    const nextTag = selectedTag.toLowerCase() === tagName.toLowerCase() ? 'all' : tagName;
    setSelectedTag(nextTag);
    updateQueryParams(selectedCategory, nextTag, searchQuery, sortBy);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateQueryParams(selectedCategory, selectedTag, query, sortBy);
  };

  const handleSortChange = (newSort: 'latest' | 'popular' | 'oldest') => {
    setSortBy(newSort);
    updateQueryParams(selectedCategory, selectedTag, searchQuery, newSort);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('all');
    setSearchQuery('');
    setSortBy('latest');
    updateQueryParams('all', 'all', '', 'latest');
  };

  // Extract all unique tags across published posts with counts
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      if (p.status === 'published' && Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [posts]);

  // Selected category display name for active filter chip
  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      c =>
        c.id === selectedCategory ||
        (c as any)._id === selectedCategory ||
        c.slug === selectedCategory ||
        c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [categories, selectedCategory]);

  // Multi-Filter published posts
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter(post => {
      if (post.status !== 'published') return false;

      // Category check
      const matchesCategory =
        selectedCategory === 'all' ||
        post.categoryId === selectedCategory ||
        post.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        (activeCategoryObj &&
          (post.categoryId === activeCategoryObj.id ||
            (activeCategoryObj as any)._id === post.categoryId ||
            post.categoryName?.toLowerCase() === activeCategoryObj.name.toLowerCase()));

      // Tag check
      const matchesTag =
        selectedTag === 'all' ||
        post.tags?.some(
          t => t.trim().toLowerCase() === selectedTag.trim().toLowerCase()
        );

      // Search check
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query) ||
        post.categoryName?.toLowerCase().includes(query) ||
        post.tags?.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery, activeCategoryObj]);

  // Sort posts
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === 'oldest') {
        return (
          new Date(a.publishedAt || a.createdAt).getTime() -
          new Date(b.publishedAt || b.createdAt).getTime()
        );
      }
      return (
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      );
    });
  }, [filteredPosts, sortBy]);

  // Categories that have published posts
  const publishedPostsCount = posts.filter(p => p.status === 'published').length;
  const categoriesWithPosts = useMemo(() => {
    return categories
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
  }, [categories, posts]);
  const categoryOptions = useMemo(() => {
    return categoriesWithPosts.map(cat => ({
      value: cat.id || (cat as any)._id || cat.slug || cat.name,
      label: cat.name,
      count: cat.postCount,
      color: cat.color || '#FF8F00',
    }));
  }, [categoriesWithPosts]);

  // Tag options formatted for SearchableSelect
  const tagOptions = useMemo(() => {
    return allTagsWithCounts.map(({ name, count }) => ({
      value: name,
      label: name,
      count: count,
      prefix: '#',
    }));
  }, [allTagsWithCounts]);

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery.trim().length > 0;

  return (
    <section id="recent-stories" className="py-14 sm:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header & Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-[#EAE6DF]">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Recently Uploaded</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#343131]">
              Recent Stories & Dispatches
            </h2>
            <p className="text-sm text-[#6B6661] mt-1 max-w-xl">
              The latest published articles, architectural thoughts, and technical notes from across the team.
            </p>
          </div>

          {/* Compact Single-Row Filters & Search Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] sm:w-56">
              <Search className="w-4 h-4 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#96918B] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Searchable Dropdown */}
            {categoryOptions.length > 0 && (
              <SearchableSelect
                label="Category"
                options={categoryOptions}
                selectedValue={selectedCategory}
                onChange={handleCategoryChange}
                allLabel="All Stories"
                allCount={publishedPostsCount}
                searchPlaceholder="Search categories..."
                icon={<Folder className="w-3.5 h-3.5" />}
              />
            )}

            {/* Tag Searchable Dropdown */}
            {tagOptions.length > 0 && (
              <SearchableSelect
                label="Tag"
                options={tagOptions}
                selectedValue={selectedTag}
                onChange={handleTagChange}
                allLabel="All Tags"
                searchPlaceholder="Search tags..."
                icon={<TagIcon className="w-3.5 h-3.5" />}
              />
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e =>
                  handleSortChange(e.target.value as 'latest' | 'popular' | 'oldest')
                }
                className="px-3.5 py-2 text-xs bg-white border border-[#EAE6DF] rounded-full text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer shadow-2xs appearance-none pr-8 font-medium"
              >
                <option value="latest">Sort: Newest</option>
                <option value="popular">Sort: Most Read</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#96918B]">
                <SlidersHorizontal className="w-3 h-3" />
              </div>
            </div>

            {/* Clear All Reset button if any filter is active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Result Count Status Bar if filtered */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-[#6B6661] -mt-2">
            <span>
              Showing <strong className="text-[#343131]">{sortedPosts.length}</strong> of{' '}
              <strong className="text-[#343131]">{publishedPostsCount}</strong> published stories
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#FF8F00] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Stories Grid */}
        {sortedPosts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#EAE6DF] my-6 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3E0] flex items-center justify-center text-[#FF8F00] mx-auto mb-4">
              <PenSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#343131]">No stories found</h3>
            <p className="text-sm text-[#6B6661] mt-1 max-w-md mx-auto">
              {hasActiveFilters
                ? 'No published stories match your current filter combination. Try clearing your search keyword or switching category/tag.'
                : 'No published stories have been posted yet. Be the first contributor to share insights with the team.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#EAE6DF] text-[#343131] hover:bg-[#FAF8F5] transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
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
                    {/* Cover Image & Category Overlay */}
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
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCategoryChange(post.categoryId);
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF8F5]/95 text-[#8C5D00] hover:bg-[#FFB22C] hover:text-[#343131] backdrop-blur-md shadow-xs transition-colors cursor-pointer"
                          title={`Filter by ${post.categoryName}`}
                        >
                          {post.categoryName}
                        </button>
                      </div>
                    </Link>

                    {/* Metadata: Date & Reads */}
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
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {post.tags.map(tag => {
                          const isTagActive = selectedTag.toLowerCase() === tag.toLowerCase();

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagChange(tag)}
                              className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                isTagActive
                                  ? 'bg-[#FFB22C] text-[#343131] font-bold border border-[#FF8F00]'
                                  : 'text-[#78716C] bg-[#FAF8F5] hover:bg-[#FAF3E0] hover:text-[#8C5D00] border border-[#EAE6DF]'
                              }`}
                              title={`Filter by tag #${tag}`}
                            >
                              <TagIcon className="w-2.5 h-2.5 mr-1 text-[#96918B]" />
                              <span>#{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Author + Read Link */}
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

export const RecentStoriesGrid: React.FC<RecentStoriesGridProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="py-16 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-8 bg-[#EAE6DF] rounded-full w-48" />
          <div className="h-4 bg-[#EAE6DF] rounded-full w-96 max-w-full" />
        </div>
      </div>
    }>
      <RecentStoriesGridInner {...props} />
    </Suspense>
  );
};
