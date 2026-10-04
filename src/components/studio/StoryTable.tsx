'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/common/Badge';
import { formatDate } from '@/lib/util';
import {
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle2,
  FileEdit,
  Globe,
  Search,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Tag as TagIcon,
  Filter,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Category } from '@/types';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

interface StoryTableProps {
  stories: any[];
  categories?: Category[];
  title?: string;
  isOverview?: boolean;
  viewAllHref?: string;
  totalAuthorStories?: number;
  onRefresh?: () => void;
}

export const StoryTable: React.FC<StoryTableProps> = ({
  stories,
  categories = [],
  title = 'Stories',
  isOverview = false,
  viewAllHref = '/studio/stories',
  totalAuthorStories,
  onRefresh,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<{ id: string; title: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'title'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const { del, put } = useApi();

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag, selectedStatus, sortBy]);

  // Extract all unique tags across the author's stories
  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((story) => {
      if (Array.isArray(story.tags)) {
        story.tags.forEach((tag: string) => {
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
  }, [stories]);

  // Filter stories
  const filteredStories = useMemo(() => {
    if (isOverview) return stories;

    const query = searchQuery.trim().toLowerCase();

    return stories.filter((story) => {
      // Status filter
      if (selectedStatus !== 'all' && story.status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCat =
          story.categoryId === selectedCategory ||
          story.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCat) return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        const matchesTag = Array.isArray(story.tags) && story.tags.some(
          (t: string) => t.trim().toLowerCase() === selectedTag.trim().toLowerCase()
        );
        if (!matchesTag) return false;
      }

      // Search query (title/name, excerpt, content, tags, category)
      if (query) {
        const matchesSearch =
          story.title?.toLowerCase().includes(query) ||
          story.excerpt?.toLowerCase().includes(query) ||
          story.categoryName?.toLowerCase().includes(query) ||
          (Array.isArray(story.tags) &&
            story.tags.some((t: string) => t.toLowerCase().includes(query)));

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [stories, searchQuery, selectedCategory, selectedTag, selectedStatus, isOverview]);

  // Sort stories
  const sortedStories = useMemo(() => {
    return [...filteredStories].sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (sortBy === 'oldest') {
        return (
          new Date(a.updatedAt || a.createdAt).getTime() -
          new Date(b.updatedAt || b.createdAt).getTime()
        );
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // default: newest
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
  }, [filteredStories, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(sortedStories.length / pageSize) || 1;
  const paginatedStories = useMemo(() => {
    if (isOverview) return sortedStories;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedStories.slice(startIndex, startIndex + pageSize);
  }, [sortedStories, currentPage, pageSize, isOverview]);

  const hasActiveFilters =
    !isOverview &&
    (searchQuery.trim().length > 0 ||
      selectedCategory !== 'all' ||
      selectedTag !== 'all' ||
      selectedStatus !== 'all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setSelectedStatus('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;

    setDeletingId(storyToDelete.id);
    try {
      await del(`/api/blog/${storyToDelete.id}`);
      setActionMessage('Story deleted successfully.');
      setStoryToDelete(null);
      setTimeout(() => setActionMessage(null), 3000);
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting story');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (story: any) => {
    const nextStatus = story.status === 'published' ? 'draft' : 'published';
    setTogglingId(story.id);
    try {
      await put(`/api/blog/${story.id}`, { status: nextStatus });
      setActionMessage(
        nextStatus === 'published'
          ? 'Story published successfully!'
          : 'Story moved to drafts.'
      );
      setTimeout(() => setActionMessage(null), 3000);
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating story status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden space-y-0">
      {/* Action Message Notification */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 px-5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionMessage}</span>
        </div>
      )}

      {/* Table Header Bar (Only displayed on Overview) */}
      {isOverview && (
        <div className="p-5 border-b border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="font-serif text-lg font-bold text-[#343131]">{title}</h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] font-semibold">
                Recent 5
              </span>
            </div>
            <p className="text-xs text-[#6B6661] mt-0.5">
              Showing the latest {stories.length} of {totalAuthorStories || stories.length} total authored stories
            </p>
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FAF3E0] text-[#343131] hover:text-[#8C5D00] border border-[#EAE6DF] transition-colors shadow-2xs shrink-0"
            >
              <span>View All Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Filter & Search Toolbar (Only on All Stories / non-overview page) */}
      {!isOverview && (
        <div className="p-4 sm:p-5 border-b border-[#EAE6DF] bg-[#FAF8F5]/50 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
            {/* Search Input (By title, excerpt, tag, category) */}
            <div className="relative sm:col-span-2 lg:col-span-4">
              <Search className="w-3.5 h-3.5 text-[#96918B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, topic, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#EAE6DF] rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#96918B] hover:text-[#343131] cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-1 lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer shadow-2xs font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="sm:col-span-1 lg:col-span-3">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer shadow-2xs font-medium"
              >
                <option value="all">All Tags ({allTagsWithCounts.length})</option>
                {allTagsWithCounts.map(({ name: tag, count }) => (
                  <option key={tag} value={tag}>
                    #{tag} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2 lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'oldest' | 'popular' | 'title')
                }
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer shadow-2xs font-medium"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Read</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center p-1 bg-white border border-[#EAE6DF] rounded-xl shadow-2xs text-xs overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-[#343131] text-white font-semibold shadow-2xs'
                    : 'text-[#6B6661] hover:text-[#343131]'
                }`}
              >
                All ({stories.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('published')}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === 'published'
                    ? 'bg-[#343131] text-white font-semibold shadow-2xs'
                    : 'text-[#6B6661] hover:text-[#343131]'
                }`}
              >
                Published ({stories.filter((s) => s.status === 'published').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('draft')}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === 'draft'
                    ? 'bg-[#343131] text-white font-semibold shadow-2xs'
                    : 'text-[#6B6661] hover:text-[#343131]'
                }`}
              >
                Drafts ({stories.filter((s) => s.status === 'draft').length})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#6B6661] font-semibold text-[11px]">Active filters:</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] border border-[#E8D8BA] text-[11px]">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] border border-[#E8D8BA] text-[11px]">
                  <span>
                    Category:{' '}
                    {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedTag !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] border border-[#E8D8BA] text-[11px]">
                  <span>Tag: #{selectedTag}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTag('all')}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] border border-[#E8D8BA] text-[11px]">
                  <span>Status: {selectedStatus}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('all')}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stories Table */}
      {paginatedStories.length === 0 ? (
        <div className="py-16 text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF3E0] flex items-center justify-center text-[#FF8F00] mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#343131]">No stories found</p>
          <p className="text-xs text-[#6B6661] mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No stories match your search and filter criteria. Try clearing some filters.'
              : "You haven't written any stories yet. Start writing your first essay today."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#EAE6DF] text-[#343131] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <Link
              href="/studio/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors cursor-pointer"
            >
              <span>Write a New Story</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
              <tr>
                <th scope="col" className="px-5 py-3.5">Title & Excerpt</th>
                <th scope="col" className="px-4 py-3.5">Category</th>
                <th scope="col" className="px-4 py-3.5">Tags</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Last Updated</th>
                <th scope="col" className="px-4 py-3.5 text-center">Reads</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {paginatedStories.map((story) => {
                const formattedDate = formatDate(story.updatedAt || story.createdAt);
                const isPublished = story.status === 'published';

                return (
                  <tr key={story.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Title & Excerpt */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="space-y-1">
                        <Link
                          href={`/studio/edit/${story.id}`}
                          className="font-serif text-sm font-bold text-[#343131] hover:text-[#FF8F00] transition-colors line-clamp-2 leading-snug"
                        >
                          {story.title}
                        </Link>
                        <p className="text-[#6B6661] text-[11px] line-clamp-1">
                          {story.excerpt}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C5D00] text-[11px] font-medium">
                        {story.categoryName}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-4">
                      {Array.isArray(story.tags) && story.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {story.tags.slice(0, 2).map((t: string) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => !isOverview && setSelectedTag(t)}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-colors ${
                                !isOverview && selectedTag.toLowerCase() === t.toLowerCase()
                                  ? 'bg-[#FFB22C] text-[#343131] border-[#FF8F00] font-semibold'
                                  : 'bg-[#FAF8F5] text-[#78716C] border-[#EAE6DF] hover:border-[#D5CFC5]'
                              }`}
                              title={!isOverview ? `Filter by #${t}` : undefined}
                            >
                              #{t}
                            </button>
                          ))}
                          {story.tags.length > 2 && (
                            <span className="text-[10px] text-[#96918B] px-1 py-0.5">
                              +{story.tags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#C2BCB3] italic">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge status={story.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-[#6B6661] text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#96918B]" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-4 whitespace-nowrap text-center text-[#6B6661] font-medium">
                      <span className="flex items-center justify-center space-x-1">
                        <Eye className="w-3 h-3 text-[#96918B]" />
                        <span>{story.viewCount || 0}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Publish / Draft */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(story)}
                          disabled={togglingId === story.id}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors font-medium text-[11px] cursor-pointer ${
                            isPublished
                              ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                              : 'bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] hover:text-[#343131]'
                          }`}
                          title={isPublished ? 'Move to draft' : 'Publish story'}
                        >
                          {isPublished ? (
                            <>
                              <FileEdit className="w-3 h-3" />
                              <span>{togglingId === story.id ? 'Updating...' : 'Unpublish'}</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3" />
                              <span>{togglingId === story.id ? 'Publishing...' : 'Publish'}</span>
                            </>
                          )}
                        </button>

                        {/* View public essay if published */}
                        {isPublished && (
                          <Link
                            href={`/stories/${story.slug || story.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                            title="View public essay"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Edit Action */}
                        <Link
                          href={`/studio/edit/${story.id}`}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                          title="Edit story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => setStoryToDelete({ id: story.id, title: story.title })}
                          disabled={deletingId === story.id}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#96918B] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls (when not in overview mode and multiple pages exist) */}
      {!isOverview && sortedStories.length > 0 && (
        <div className="p-4 border-t border-[#EAE6DF] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#6B6661] font-medium">
            Showing{' '}
            <span className="font-semibold text-[#343131]">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#343131]">
              {Math.min(currentPage * pageSize, sortedStories.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#343131]">
              {sortedStories.length}
            </span>{' '}
            stories (Limit: {pageSize} / page)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Show pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#343131] text-white shadow-2xs'
                        : 'bg-white border border-[#EAE6DF] text-[#343131] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }

              if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return (
                  <span key={pageNum} className="px-1 text-[#96918B]">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={
          <span>
            Are you sure you want to permanently delete{' '}
            <strong className="font-bold text-[#343131]">
              &quot;{storyToDelete?.title}&quot;
            </strong>
            ? This action cannot be undone.
          </span>
        }
        confirmText="Delete Story"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!deletingId}
      />
    </div>
  );
};
