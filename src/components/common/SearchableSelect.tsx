'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Tag, Folder } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  prefix?: string;
}

export interface SearchableSelectProps {
  label: string;
  options: SearchableOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  allLabel?: string;
  allCount?: number;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  allLabel = 'All',
  allCount,
  searchPlaceholder = 'Search...',
  icon,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Selected option details
  const isAllSelected = selectedValue === 'all' || !selectedValue;
  const currentSelectedOption = useMemo(() => {
    if (isAllSelected) return null;
    return options.find(
      opt =>
        opt.value.toLowerCase() === selectedValue.toLowerCase() ||
        opt.label.toLowerCase() === selectedValue.toLowerCase()
    );
  }, [options, selectedValue, isAllSelected]);

  // Filter options based on inner search
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const query = searchTerm.toLowerCase().trim();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      (opt.prefix && `${opt.prefix}${opt.label}`.toLowerCase().includes(query))
    );
  }, [options, searchTerm]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('all');
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-2xs ${
          !isAllSelected
            ? 'bg-[#FAF3E0] border-[#FFB22C] text-[#343131] font-semibold ring-1 ring-[#FFB22C]/40'
            : 'bg-white border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] hover:text-[#343131]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className="text-[#FF8F00]">{icon}</span>}

        <span className="truncate max-w-[130px] sm:max-w-[160px]">
          {isAllSelected ? (
            <span>
              {label}: <span className="font-semibold text-[#343131]">{allLabel}</span>
            </span>
          ) : (
            <span>
              {label}:{' '}
              <span className="font-bold text-[#8C5D00]">
                {currentSelectedOption?.prefix || ''}
                {currentSelectedOption?.label || selectedValue}
              </span>
            </span>
          )}
        </span>

        {/* Count badge */}
        {!isAllSelected && currentSelectedOption?.count !== undefined && (
          <span className="px-1.5 py-0.2 rounded-full bg-[#FFB22C]/30 text-[#8C5D00] text-[10px] font-bold">
            {currentSelectedOption.count}
          </span>
        )}

        {/* Clear or Chevron */}
        {!isAllSelected ? (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-[#E8D8BA] text-[#8C5D00] hover:text-rose-600 transition-colors ml-0.5"
            title="Clear selection"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#96918B] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#343131]' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-auto sm:right-0 mt-2 w-64 sm:w-72 bg-white border border-[#EAE6DF] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Inner Search Box */}
          <div className="p-2.5 border-b border-[#EAE6DF] bg-[#FAF8F5]/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#96918B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#EAE6DF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FFB22C] text-[#343131] placeholder-[#96918B]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#96918B] hover:text-[#343131] p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List (Compact Max Height ~190px) */}
          <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {/* "All" Option */}
            {!searchTerm && (
              <button
                type="button"
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isAllSelected
                    ? 'bg-[#FAF3E0] text-[#8C5D00] font-bold'
                    : 'text-[#343131] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="truncate">{allLabel}</span>
                  {allCount !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAE6DF]/60 text-[#6B6661]">
                      {allCount}
                    </span>
                  )}
                </div>
                {isAllSelected && <Check className="w-3.5 h-3.5 text-[#8C5D00] shrink-0" />}
              </button>
            )}

            {/* Filtered Options */}
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#96918B]">
                No {label.toLowerCase()} found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected =
                  selectedValue.toLowerCase() === opt.value.toLowerCase() ||
                  selectedValue.toLowerCase() === opt.label.toLowerCase();

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#FAF3E0] text-[#8C5D00] font-bold'
                        : 'text-[#343131] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      {opt.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span className="truncate">
                        {opt.prefix || ''}
                        {opt.label}
                      </span>
                      {opt.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-[#FFB22C]/30 text-[#8C5D00]'
                              : 'bg-[#FAF8F5] text-[#96918B]'
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8C5D00] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
