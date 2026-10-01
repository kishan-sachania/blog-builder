'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileEditorProps {
  user: User;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user.name || '',
    title: user.title || '',
    department: user.department || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/authors/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setFormData({
      ...formData,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}`
    });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-2xs space-y-6">
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#EAE6DF]">
          <Avatar src={formData.avatarUrl} name={formData.name} size="xl" className="w-20 h-20 text-xl" />

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131]">
              Author Avatar URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
              />
              <button
                type="button"
                onClick={generateRandomAvatar}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] transition-colors cursor-pointer"
                title="Generate illustration avatar"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>
            </div>
            <p className="text-[11px] text-[#96918B]">
              Accepts Unsplash, DiceBear, or standard profile image URLs.
            </p>
          </div>
        </div>

        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1.5">
              Email Address (Immutable)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs bg-[#F4EFE6] border border-[#EAE6DF] rounded-xl text-[#96918B] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Title & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1.5">
              Professional Role / Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1.5">
              Department / Practice Group
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1.5">
            Public Author Bio
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Share what subjects you write about, your engineering or design philosophy, and areas of focus..."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] leading-relaxed resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
