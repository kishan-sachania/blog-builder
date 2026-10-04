'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';
import { AvatarUpload } from '@/components/common/AvatarUpload';
import { Save, Shield, ArrowRight } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { GenericForm, FormFieldConfig } from '@/components/common/Form';
import { profileSchema, ProfileFormData } from '@/lib/validations';

interface ProfileEditorProps {
  user: User;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user }) => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { put, loading: isSaving, error } = useApi();

  const isAdmin = user.role === 'admin';

  const profileFields: FormFieldConfig<ProfileFormData>[] = [
    {
      name: 'avatarUrl',
      type: 'custom',
      render: ({ field }) => (
        <AvatarUpload
          value={field.value || ''}
          onChange={(url) => field.onChange(url)}
          name={user.name || 'Author'}
        />
      ),
    },
    {
      name: 'name',
      label: 'Display Name',
      type: 'text',
      placeholder: 'Your full name',
      required: true,
    },
    {
      name: 'bio',
      label: 'Public Author Bio',
      type: 'textarea',
      placeholder: 'Share what subjects you write about, your engineering or design philosophy, and areas of focus...',
      rows: 4,
      helperText: 'Brief summary displayed on your public author archive and article cards.',
    },
  ];

  const handleSubmit = async (data: ProfileFormData) => {
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
        <GenericForm<ProfileFormData>
          schema={profileSchema}
          fields={profileFields}
          defaultValues={{
            name: user.name || '',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl || '',
          }}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          error={error}
          success={successMessage}
          submitText="Save Profile"
          submitIcon={<Save className="w-4 h-4 ml-1" />}
          submitClassName="w-auto px-8 py-3 bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white ml-auto"
        />
      </div>
    </div>
  );
};
