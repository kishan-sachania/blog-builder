'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Shield, UserCheck, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface AuthorWithStats extends User {
  publishedStoriesCount: number;
  totalReads: number;
}

interface AuthorManagerProps {
  authors: AuthorWithStats[];
  currentUserId: string;
}

export const AuthorManager: React.FC<AuthorManagerProps> = ({ authors, currentUserId }) => {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRoleToggle = async (targetUser: AuthorWithStats) => {
    if (targetUser.id === currentUserId) {
      alert("You cannot modify your own administrative privileges.");
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'employee' : 'admin';
    const confirmText = targetUser.role === 'admin'
      ? `Revoke administrator access for ${targetUser.name}?`
      : `Promote ${targetUser.name} to Editorial Board Administrator?`;

    if (!confirm(confirmText)) return;

    setUpdatingId(targetUser.id);
    try {
      const res = await fetch(`/api/authors/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) throw new Error('Role update failed');
      setMessage(`Updated ${targetUser.name}'s role to ${newRole}`);
      setTimeout(() => setMessage(null), 3000);
      router.refresh();
    } catch (err) {
      alert('Error updating user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#343131]">
            Authors & Editorial Governance
          </h2>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Manage contributors, view publication metrics, and delegate editorial privileges.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
            <tr>
              <th scope="col" className="px-5 py-3.5">Author</th>
              <th scope="col" className="px-5 py-3.5">Department & Role</th>
              <th scope="col" className="px-4 py-3.5">System Role</th>
              <th scope="col" className="px-4 py-3.5 text-center">Published</th>
              <th scope="col" className="px-4 py-3.5 text-center">Reads</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]">
            {authors.map(author => (
              <tr key={author.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <Avatar src={author.avatarUrl} name={author.name} size="sm" />
                    <div>
                      <span className="font-serif font-bold text-sm text-[#343131] block">
                        {author.name}
                      </span>
                      <span className="text-[11px] text-[#6B6661]">
                        {author.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-[#6B6661]">
                  <p className="font-medium text-[#343131]">{author.title}</p>
                  <p className="text-[11px] text-[#96918B]">{author.department}</p>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {author.role === 'admin' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase tracking-wider">
                      <Shield className="w-3 h-3 text-[#FF8F00]" />
                      <span>Admin</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium text-[10px] uppercase tracking-wider">
                      <UserCheck className="w-3 h-3 text-[#96918B]" />
                      <span>Employee</span>
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-center font-semibold text-[#343131]">
                  {author.publishedStoriesCount}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-center text-[#6B6661]">
                  {author.totalReads}
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/authors/${author.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors"
                      title="View Public Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {author.id !== currentUserId && (
                      <button
                        type="button"
                        disabled={updatingId === author.id}
                        onClick={() => handleRoleToggle(author)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          author.role === 'admin'
                            ? 'border border-stone-300 text-stone-700 hover:bg-stone-100'
                            : 'bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] hover:text-[#343131]'
                        }`}
                      >
                        {author.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
