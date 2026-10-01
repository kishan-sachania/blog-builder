import React from 'react';
import { FileText, CheckCircle2, Clock, FileEdit, Eye } from 'lucide-react';

interface StudioStatsProps {
  total: number;
  published: number;
  inReview: number;
  drafts: number;
  views: number;
}

export const StudioStats: React.FC<StudioStatsProps> = ({
  total,
  published,
  inReview,
  drafts,
  views
}) => {
  const cards = [
    {
      label: 'All Stories',
      value: total,
      icon: FileText,
      color: 'text-stone-700 bg-stone-100',
      description: 'Total written'
    },
    {
      label: 'Published',
      value: published,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-100',
      description: 'Live in public journal'
    },
    {
      label: 'In Review',
      value: inReview,
      icon: Clock,
      color: 'text-amber-700 bg-amber-100',
      description: 'Awaiting editor review'
    },
    {
      label: 'Drafts',
      value: drafts,
      icon: FileEdit,
      color: 'text-blue-700 bg-blue-100',
      description: 'In-progress drafts'
    },
    {
      label: 'Total Reads',
      value: views,
      icon: Eye,
      color: 'text-orange-700 bg-orange-100',
      description: 'Cumulative views'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#6B6661]">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#343131]">
                {card.value}
              </span>
              <p className="text-[11px] text-[#96918B] mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
