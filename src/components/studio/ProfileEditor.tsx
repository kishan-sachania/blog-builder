'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';
import { AvatarUpload } from '@/components/common/AvatarUpload';
import { Save, Shield, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import { profileSchema, ProfileFormData } from '@/lib/validations';

interface ProfileEditorProps {
  user: User;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user }) => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { put, loading: isSaving, error } = useApi();

  const isAdmin = user.role === 'admin';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSuccessMessage(null);
    try {
      await put(`/api/user/${user.id}`, data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
      router.refresh();
    } catch {
      // Error handled by useApi
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Navigation Banner */}
      {isAdmin && (
        <div className="p-5 rounded-3xl bg-[#232020] text-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#343131] shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB22C] flex items-center justify-center text-[#343131] shrink-0">
              <Shield className="w-5 h-5 text-[#343131]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-sm text-white">
                  Admin Control Panel Access
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF8F00] text-white font-bold uppercase tracking-wider">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-[#C7C2BA] mt-0.5">
                Manage platform users, story indexes, categories, and editorial telemetry.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Open Admin Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-2xs space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Avatar Field */}
          <Controller
            name="avatarUrl"
            control={control}
            render={({ field }) => (
              <AvatarUpload
                value={field.value || ''}
                onChange={(url) => field.onChange(url)}
                name={user.name || 'Author'}
              />
            )}
          />

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#343131]">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your full name"
              {...register('name')}
              className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Bio Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#343131]">
              Public Author Bio
            </label>
            <textarea
              rows={4}
              placeholder="Share what subjects you write about, your engineering or design philosophy, and areas of focus..."
              {...register('bio')}
              className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors resize-none ${
                errors.bio ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
              }`}
            />
            <p className="text-[11px] text-[#6B6661]">
              Brief summary displayed on your public author archive and article cards.
            </p>
            {errors.bio && (
              <p className="text-[11px] text-rose-600">{errors.bio.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Profile</span>
                  <Save className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
