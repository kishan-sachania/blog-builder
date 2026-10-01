'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Badge } from '@/components/common/Badge';
import {
  Edit3,
  Trash2,
  ExternalLink,
  Send,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface StoryTableProps {
  stories: Post[];
  title?: string;
  onRefresh?: () => void;
}

export const StoryTable: React.FC<StoryTableProps> = ({
  stories,
  title = 'Stories',
  onRefresh
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleDelete = async (id: string, storyTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${storyTitle}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete story');
      }
      setActionMessage('Story deleted successfully.');
      setTimeout(() => setActionMessage(null), 3000);
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting story');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_review' })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit story');
      }
      setActionMessage('Story submitted to the editorial review queue!');
      setTimeout(() => setActionMessage(null), 3000);
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting story');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#343131]">{title}</h3>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Showing {stories.length} {stories.length === 1 ? 'article' : 'articles'}
          </p>
        </div>

        {actionMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {stories.length === 0 ? (
        <div className="py-16 text-center p-6">
          <p className="text-sm font-medium text-[#343131]">No stories in this view</p>
          <p className="text-xs text-[#6B6661] mt-1 max-w-sm mx-auto">
            You don&apos;t have any stories matching this status filter yet.
          </p>
          <Link
            href="/studio/new"
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors"
          >
            <span>Write a New Story</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
              <tr>
                <th scope="col" className="px-5 py-3.5">Title & Excerpt</th>
                <th scope="col" className="px-4 py-3.5">Category</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5">Last Updated</th>
                <th scope="col" className="px-4 py-3.5 text-center">Reads</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {stories.map(story => {
                const formattedDate = new Date(story.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <tr key={story.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Title & Notes */}
                    <td className="px-5 py-4 max-w-md">
                      <div className="space-y-1">
                        <Link
                          href={`/studio/edit/${story.id}`}
                          className="font-serif text-sm font-bold text-[#343131] hover:text-[#FF8F00] transition-colors block line-clamp-1"
                        >
                          {story.title}
                        </Link>
                        <p className="text-[#6B6661] text-[11px] line-clamp-1">
                          {story.excerpt}
                        </p>

                        {/* Rejection / revision feedback notice */}
                        {story.status === 'rejected' && story.editorialNotes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                            <div className="font-semibold flex items-center space-x-1 text-rose-900">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                              <span>Editorial Feedback Note:</span>
                            </div>
                            <p className="italic pl-4 text-rose-800 leading-normal">
                              &ldquo;{story.editorialNotes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C5D00] text-[11px] font-medium">
                        {story.categoryName}
                      </span>
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
                        {/* Quick submit for review if draft or rejected */}
                        {(story.status === 'draft' || story.status === 'rejected') && (
                          <button
                            onClick={() => handleSubmitForReview(story.id)}
                            disabled={submittingId === story.id}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] hover:text-[#343131] transition-colors font-medium text-[11px] cursor-pointer"
                            title="Submit for editorial review"
                          >
                            <Send className="w-3 h-3" />
                            <span>{submittingId === story.id ? 'Submitting...' : 'Submit'}</span>
                          </button>
                        )}

                        {/* View public article if published */}
                        {story.status === 'published' && (
                          <Link
                            href={`/stories/${story.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                            title="View public essay"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Edit Button */}
                        <Link
                          href={`/studio/edit/${story.id}`}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#FF8F00] hover:bg-[#FAF8F5] transition-colors"
                          title="Edit story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(story.id, story.title)}
                          disabled={deletingId === story.id}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
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
    </div>
  );
};
