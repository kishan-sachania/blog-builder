import React from 'react';
import { PostStatus } from '@/types';

interface BadgeProps {
  status: PostStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'published':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'in_review':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'draft':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'archived':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'in_review':
        return 'In Review';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Changes Needed';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'published' ? 'bg-emerald-500' :
        status === 'in_review' ? 'bg-amber-500' :
        status === 'rejected' ? 'bg-rose-500' :
        'bg-stone-400'
      }`} />
      {getLabel()}
    </span>
  );
};
