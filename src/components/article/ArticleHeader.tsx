'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Clock, Calendar, Share2, Check, Bookmark, Eye } from 'lucide-react';

interface ArticleHeaderProps {
  post: Post;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="max-w-3xl mx-auto pt-10 pb-8 px-4 sm:px-6">
      {/* Category Pill & Read time */}
      <div className="flex items-center space-x-3 mb-6">
        <Link
          href={`/topics`}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C]/30 transition-colors"
        >
          {post.categoryName}
        </Link>
        <span className="text-xs text-[#96918B]">•</span>
        <span className="text-xs text-[#6B6661] flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
          {post.readingTimeMinutes} min read
        </span>
        {post.viewCount > 0 && (
          <>
            <span className="text-xs text-[#96918B]">•</span>
            <span className="text-xs text-[#6B6661] flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1 text-[#96918B]" />
              {post.viewCount} views
            </span>
          </>
        )}
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#343131] leading-[1.18] mb-4">
        {post.title}
      </h1>

      {/* Subtitle / Excerpt */}
      {post.excerpt && (
        <p className="text-lg sm:text-xl text-[#6B6661] font-light leading-relaxed mb-8">
          {post.excerpt}
        </p>
      )}

      {/* Author Bar & Actions */}
      <div className="pt-6 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <Link href={`/authors/${post.authorId}`}>
            <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
          </Link>
          <div>
            <Link
              href={`/authors/${post.authorId}`}
              className="text-sm font-semibold text-[#343131] hover:text-[#FF8F00] transition-colors"
            >
              {post.authorName}
            </Link>
            <div className="flex items-center space-x-2 text-xs text-[#6B6661]">
              <span>{post.authorTitle}</span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-[#96918B]" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2 text-[#6B6661]">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-full border border-[#EAE6DF] hover:bg-white transition-colors ${
              bookmarked ? 'text-[#FF8F00] bg-white border-[#FF8F00]' : ''
            }`}
            title="Bookmark story"
            aria-label="Bookmark story"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#EAE6DF] hover:bg-white transition-colors text-xs font-medium text-[#343131]"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
