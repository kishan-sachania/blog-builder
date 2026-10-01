'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { FolderPlus, Edit2, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface CategoryManagerProps {
  categories: (Category & { postCount: number })[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories }) => {
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FF8F00');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#FF8F00');
    setIsAdding(false);
    setEditingCategory(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setColor(cat.color);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color })
        });
        if (!res.ok) throw new Error('Failed to update category');
        setStatusMessage('Category updated successfully');
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color })
        });
        if (!res.ok) throw new Error('Failed to create category');
        setStatusMessage('New channel created successfully');
      }

      resetForm();
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error saving category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setStatusMessage('Category removed');
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#343131]">
            Categories & Channels
          </h2>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Organize articles into thematic disciplines for discovery across the enterprise.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { resetForm(); setIsAdding(!isAdding); }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Create New Category'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Creation / Edit Form Card */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-white border border-[#FFB22C] shadow-sm animate-in fade-in space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#343131]">
            {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Editorial Category'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Tools"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1">
                  Theme Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-[#EAE6DF] rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1">
                Description & Scope
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What topics fall under this discipline?"
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs rounded-xl border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors"
              >
                {isLoading ? 'Saving...' : editingCategory ? 'Update Channel' : 'Save Channel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
            <tr>
              <th scope="col" className="px-5 py-3.5">Color & Name</th>
              <th scope="col" className="px-5 py-3.5">Slug</th>
              <th scope="col" className="px-5 py-3.5">Description</th>
              <th scope="col" className="px-4 py-3.5 text-center">Published Essays</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DF]">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-serif font-bold text-sm text-[#343131]">
                      {cat.name}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-[#6B6661] font-mono text-[11px]">
                  /{cat.slug}
                </td>

                <td className="px-5 py-4 max-w-xs text-[#6B6661] line-clamp-1">
                  {cat.description}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] font-semibold text-[11px]">
                    {cat.postCount}
                  </span>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#FF8F00] hover:bg-[#FAF8F5] transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
