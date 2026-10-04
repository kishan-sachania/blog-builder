import React from 'react';
import { FileText, CheckCircle2, FileEdit, Eye } from 'lucide-react';

interface StudioStatsProps {
  total: number;
  published: number;
  drafts: number;
  views: number;
}

export const StudioStats: React.FC<StudioStatsProps> = ({
  total,
  published,
  drafts,
  views
}) => {
  const cards = [
    {
      label: 'All Stories',
      value: total,
      icon: FileText,
      color: 'text-stone-700 bg-stone-100',
      description: 'Total authored'
    },
    {
      label: 'Published',
      value: published,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-100',
      description: 'Live in public journal'
    },
    {
      label: 'Drafts',
      value: drafts,
      icon: FileEdit,
      color: 'text-amber-700 bg-amber-100',
      description: 'Saved work in progress'
    },
    {
      label: 'Total Reads',
      value: views,
      icon: Eye,
      color: 'text-orange-700 bg-orange-100',
      description: 'Cumulative reader views'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#6B6661] truncate mr-1">{card.label}</span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#343131]">
                {card.value}
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#96918B] mt-0.5 sm:mt-1 truncate">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
