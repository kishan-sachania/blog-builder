'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';

import { apiClient } from '@/lib/axios';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'landscape' | 'square';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Cover Image',
  helperText = 'Upload a high-resolution image (JPG, PNG, WebP) or provide a URL.',
  aspectRatio = 'landscape',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image file size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resData = res.data?.data || res.data;
      const imageUrl = resData?.secure_url || resData?.url;

      if (imageUrl) {
        onChange(imageUrl);
        setSuccessMessage('Image uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Image URL missing in response');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#343131]">
          {label}
        </label>
       
      </div>

      {showUrlInput ? (
        <form onSubmit={handleManualUrlSubmit} className="flex gap-2">
          <input
            type="url"
            placeholder="Paste image link (e.g. https://...)..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#FFB22C] text-[#343131] rounded-xl text-xs font-bold hover:bg-[#FF8F00] hover:text-white transition-colors cursor-pointer"
          >
            Apply URL
          </button>
        </form>
      ) : value ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-[#EAE6DF] bg-[#FAF8F5] group shadow-2xs">
          <div className={`relative w-full ${aspectRatio === 'square' ? 'h-48 sm:h-64' : 'h-52 sm:h-64'}`}>
            <Image
              src={value}
              alt="Uploaded Cover"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-[#343131] text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#FF8F00]" />
              <span>Replace Image</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${isDragOver
              ? 'border-[#FF8F00] bg-[#FAF3E0]/40'
              : 'border-[#EAE6DF] bg-white hover:border-[#FFB22C] hover:bg-[#FAF8F5]/60'
            }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-center text-[#FF8F00] shadow-2xs">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#FF8F00]" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#343131]">
              {isUploading ? 'Uploading image...' : 'Click or Drag & Drop to Upload Image'}
            </p>
            <p className="text-[11px] text-[#96918B] mt-0.5">{helperText}</p>
          </div>

         
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Status Messages */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
