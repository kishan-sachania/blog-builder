'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  name?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  name = 'Author',
}) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = (name || 'AU')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await apiClient.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data?.data?.url || res.data?.data?.secure_url || res.data?.url;
      if (url) onChange(url);
    } catch {
      // Handled silently or by axios interceptor
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-5 py-2">
      {/* Clickable Avatar Circle */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full overflow-hidden border border-[#EAE6DF] bg-[#FAF3E0] cursor-pointer hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center text-[#8C5D00] font-bold text-xl font-serif"
      >
        {value ? (
          <Image src={value} alt={name} fill className="object-cover" sizes="80px" />
        ) : (
          <span>{initials}</span>
        )}

        {/* Hover / Active Indicator */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera className="w-5 h-5" />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-1 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="font-semibold text-[#343131] hover:text-[#FF8F00] cursor-pointer block"
        >
          {value ? 'Change Photo' : 'Upload Photo'}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};
