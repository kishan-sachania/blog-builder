'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Users, FileEdit } from 'lucide-react';

interface AdminStatsProps {
  totalStories: number;
  publishedStories: number;
  pendingReviews?: number;
  activeAuthors: number;
  totalViews?: number;
  draftsCount: number;
  mostActiveEmployee?: any;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  totalStories,
  publishedStories,
  activeAuthors,
  draftsCount,
}) => {
  const cards = [
    {
      label: 'Published Essays',
      value: publishedStories,
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
      borderColor: 'border-[#EAE6DF] bg-white',
      description: 'Live in public journal'
    },
    {
      label: 'Active Authors',
      value: activeAuthors,
      icon: Users,
      color: 'bg-blue-600 text-white',
      borderColor: 'border-[#EAE6DF] bg-white',
      description: 'Employee contributors'
    },
    {
      label: 'Total Archive',
      value: totalStories,
      icon: BookOpen,
      color: 'bg-stone-700 text-white',
      borderColor: 'border-[#EAE6DF] bg-white',
      description: 'All system submissions'
    },
    {
      label: 'In-Flight Drafts',
      value: draftsCount,
      icon: FileEdit,
      color: 'bg-purple-600 text-white',
      borderColor: 'border-[#EAE6DF] bg-white',
      description: 'Unpublished drafts'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-5 rounded-2xl border shadow-2xs flex flex-col justify-between ${card.borderColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#6B6661]">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
                  {card.value}
                </span>
                <p className="text-[10px] text-[#96918B] mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
