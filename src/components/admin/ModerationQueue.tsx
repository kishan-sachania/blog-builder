'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { ModerationModal } from './ModerationModal';
import { CheckCircle2, Eye, Calendar } from 'lucide-react';

import { useApi } from '@/hooks/useApi';

interface ModerationQueueProps {
  pendingPosts: any[];
  title?: string;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  pendingPosts,
  title = 'Pending Editorial Review Queue'
}) => {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickProcessingId, setQuickProcessingId] = useState<string | null>(null);
  const { put } = useApi();

  const handleQuickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickProcessingId(id);

    try {
      await put(`/api/blog/${id}`, { status: 'published' });
      router.refresh();
    } catch (err) {
      alert('Error approving story');
      console.error(err);
    } finally {
      setQuickProcessingId(null);
    }
  };

  const handleOpenReview = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif text-lg font-bold text-[#343131]">{title}</h3>
            {pendingPosts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF8F00] text-white">
                {pendingPosts.length} pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Submissions from staff authors requiring review before public publishing.
          </p>
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="py-16 text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#343131]">Review Queue is All Clear!</h4>
          <p className="text-xs text-[#6B6661] max-w-sm mx-auto">
            All submitted articles have been reviewed. When an employee submits a new story, it will appear here for editorial signoff.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#EAE6DF]">
          {pendingPosts.map(post => {
            const submittedDate = post.submittedAt
              ? new Date(post.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
              : new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

            return (
              <div
                key={post.id}
                onClick={() => handleOpenReview(post)}
                className="p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Author and Story info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6661]">
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] text-[10px] font-semibold">
                      {post.categoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-[#343131] font-semibold">
                      <Avatar src={post.authorAvatar} name={post.authorName} size="xs" className="mr-1.5" />
                      {post.authorName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-[#96918B] text-[11px]">
                      <Calendar className="w-3 h-3 mr-1" />
                      Submitted: {submittedDate}
                    </span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#343131] hover:text-[#FF8F00] transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>

                  <p className="text-xs text-[#6B6661] line-clamp-2 max-w-3xl leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-end md:self-center" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(post)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#6B6661]" />
                    <span>Review Full Text</span>
                  </button>

                  <button
                    type="button"
                    disabled={quickProcessingId === post.id}
                    onClick={e => handleQuickApprove(post.id, e)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{quickProcessingId === post.id ? 'Publishing...' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Modal Drawer */}
      <ModerationModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionComplete={() => {
          router.refresh();
        }}
      />
    </div>
  );
};
