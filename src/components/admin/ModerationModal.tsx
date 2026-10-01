'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import {
  X,
  CheckCircle2,
  XCircle,
  FileEdit,
  Clock,
  Calendar,
  Archive,
  AlertCircle
} from 'lucide-react';

interface ModerationModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  post,
  isOpen,
  onClose,
  onActionComplete
}) => {
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleModeration = async (action: 'approved' | 'rejected' | 'changes_requested' | 'archived') => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${post.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: feedbackNote.trim() || undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to execute moderation action');
      }

      onActionComplete();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error processing moderation');
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedDate = post.submittedAt
    ? new Date(post.submittedAt).toLocaleDateString('en-US', {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-[#EAE6DF] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF8F00]">
              Editorial Review
            </span>
            <Badge status={post.status} />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAE6DF] text-[#6B6661] hover:text-[#343131] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Author bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#EAE6DF]">
            <div className="flex items-center space-x-3.5">
              <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
              <div>
                <h4 className="text-sm font-semibold text-[#343131]">{post.authorName}</h4>
                <p className="text-xs text-[#6B6661]">{post.authorTitle}</p>
              </div>
            </div>

            <div className="text-xs text-[#6B6661] flex items-center space-x-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
                Submitted: {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
                {post.readingTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Article Title & Excerpt */}
          <div className="space-y-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF3E0] text-[#8C5D00]">
              {post.categoryName}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131] leading-tight">
              {post.title}
            </h2>
            <p className="text-base text-[#6B6661] italic leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Cover image preview */}
          {post.coverImage && (
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-[#EAE6DF] border border-[#EAE6DF]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Body Content */}
          <div className="pt-4 border-t border-[#EAE6DF]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#96918B] mb-3">
              Full Text Submission
            </h5>
            <div className="prose-editorial max-w-none text-sm leading-relaxed space-y-4 text-[#343131] bg-[#FAF8F5] p-6 rounded-2xl border border-[#EAE6DF]">
              {post.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Editorial Feedback Note Input */}
          <div className="pt-4 border-t border-[#EAE6DF] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131]">
              Reviewer Editorial Notes & Feedback
            </label>
            <p className="text-[11px] text-[#6B6661]">
              Provide feedback or revisions needed. This will be visible to the author in their studio dashboard.
            </p>
            <textarea
              rows={3}
              value={feedbackNote}
              onChange={e => setFeedbackNote(e.target.value)}
              placeholder="e.g. 'Strong architectural reasoning. Approved for front-page feature!' or 'Please add latency percentiles to section 2 before resubmitting.'"
              className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] resize-none"
            />
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="p-5 border-t border-[#EAE6DF] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleModeration('archived')}
            disabled={isProcessing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleModeration('changes_requested')}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <FileEdit className="w-3.5 h-3.5 text-amber-700" />
              <span>Request Changes</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeration('rejected')}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Reject Submission</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeration('approved')}
              disabled={isProcessing}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
