'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPaginatedData, useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@/components/common/Badge';
import {
  Edit3,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  X,
} from 'lucide-react';

interface AdminBlogListProps {
  initialStatus?: string;
}

export const AdminBlogList: React.FC<AdminBlogListProps> = ({ initialStatus = 'all' }) => {
  const [activeStatus, setActiveStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const isFirstMount = useRef(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Hook for CRUD operations
  const { put, del, loading: isMutating } = useApi();

  // Paginated Data Hook for Admin Blog List
  const {
    data: blogs,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    setFilters,
    nextPage,
    prevPage,
    refetch,
  } = getPaginatedData('/api/blog', 10);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
    setFilters((prev: any) => ({
      ...prev,
      status: status === 'all' ? undefined : status,
    }));
  };

  // Debounced search effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    setFilters((prev: any) => ({
      ...prev,
      search: debouncedSearch.trim() || undefined,
    }));
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilters((prev: any) => ({
      ...prev,
      search: searchQuery.trim() || undefined,
    }));
  };

  const handleTogglePublish = async (blog: any) => {
    const blogId = blog._id || blog.id;
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      await put(`/api/blog/${blogId}`, { status: newStatus });
      setActionMessage(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update status');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleDelete = async (blog: any) => {
    const blogId = blog._id || blog.id;
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

    try {
      await del(`/api/blog/${blogId}`);
      setActionMessage('Blog deleted successfully.');
      setTimeout(() => setActionMessage(null), 3000);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete blog');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden space-y-0">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-[#EAE6DF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#343131] flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#FF8F00]" />
            <span>Master Article Directory</span>
          </h3>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Showing {blogs.length} of {total} total {total === 1 ? 'article' : 'articles'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-[#96918B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 py-1.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] w-48 sm:w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                  setFilters((prev: any) => ({ ...prev, search: undefined }));
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#96918B] hover:text-[#343131]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF] text-xs">
            {['all', 'published', 'draft'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${activeStatus === st
                    ? 'bg-[#343131] text-white'
                    : 'text-[#6B6661] hover:text-[#343131]'
                  }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 rounded-xl border border-[#EAE6DF] text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF8F00]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="mx-5 my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="mx-5 my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FF8F00] mx-auto mb-2" />
          <p className="text-xs text-[#6B6661]">Loading articles from database...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center p-6">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#EAE6DF] hover:bg-white text-[#343131]"
          >
            Try Again
          </button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-16 text-center p-6">
          <p className="text-sm font-medium text-[#343131]">No articles found</p>
          <p className="text-xs text-[#6B6661] mt-1 max-w-sm mx-auto">
            There are no articles matching the current status or search criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
              <tr>
                <th scope="col" className="px-5 py-3.5">Title & Excerpt</th>
                <th scope="col" className="px-4 py-3.5">Author</th>
                <th scope="col" className="px-4 py-3.5">Category</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Created Date</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {blogs.map((blog: any) => {
                const blogId = blog._id || blog.id;
                const authorName = blog.author?.name || 'Staff Writer';
                const authorEmail = blog.author?.email || '';
                const categoryName = blog.category?.name || 'General';
                const formattedDate = new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={blogId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-4 max-w-md">
                      <div className="space-y-1">
                        <Link
                          href={`/studio/edit/${blogId}`}
                          className="font-serif text-sm font-bold text-[#343131] hover:text-[#FF8F00] transition-colors block line-clamp-1"
                        >
                          {blog.title}
                        </Link>
                        <p className="text-[#6B6661] text-[11px] line-clamp-1">
                          {blog.content?.substring(0, 100) || 'No excerpt available...'}
                        </p>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-[#343131] block">{authorName}</span>
                        {authorEmail && <span className="text-[10px] text-[#96918B]">{authorEmail}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C5D00] text-[11px] font-medium">
                        {categoryName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge status={blog.status || 'draft'} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-[#6B6661] text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#96918B]" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Publish / Unpublish Toggle */}
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleTogglePublish(blog)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${blog.status === 'published'
                              ? 'border border-[#EAE6DF] text-stone-700 hover:bg-[#FAF8F5]'
                              : 'bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] hover:text-[#343131]'
                            }`}
                          title={blog.status === 'published' ? 'Unpublish blog' : 'Publish blog'}
                        >
                          {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/studio/edit/${blogId}`}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#FF8F00] hover:bg-[#FAF8F5] transition-colors"
                          title="Edit article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleDelete(blog)}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                          title="Delete article"
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

      {/* Pagination Footer Controls */}
      <div className="p-4 border-t border-[#EAE6DF] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 text-[#6B6661]">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 bg-white border border-[#EAE6DF] rounded-lg text-[#343131] focus:outline-none focus:ring-1 focus:ring-[#FFB22C] cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline">•</span>
          <span>
            Page <strong className="text-[#343131]">{page}</strong> of <strong className="text-[#343131]">{totalPages}</strong>
          </span>
        </div>

        {/* Next / Prev Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={!hasPrevPage || loading}
            onClick={prevPage}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p === page
                      ? 'bg-[#FFB22C] text-[#343131]'
                      : 'bg-white border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5]'
                    }`}
                >
                  {p}
                </button>
              ))}
          </div>

          <button
            type="button"
            disabled={!hasNextPage || loading}
            onClick={nextPage}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
