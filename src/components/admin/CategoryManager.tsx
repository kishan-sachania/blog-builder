'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { FolderPlus, Edit2, Trash2, CheckCircle2, AlertCircle, Plus, Folder, Hash } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface TagItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  postCount?: number;
}

interface CategoryManagerProps {
  categories: (Category & { postCount: number })[];
  initialTags?: TagItem[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  initialTags = []
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');

  // Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catColor, setCatColor] = useState('#FF8F00');

  // Tag State
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [tagName, setTagName] = useState('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { post, put, del, loading: isLoading } = useApi();

  const resetCategoryForm = () => {
    setCatName('');
    setCatDescription('');
    setCatColor('#FF8F00');
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const resetTagForm = () => {
    setTagName('');
    setIsAddingTag(false);
    setEditingTag(null);
  };

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatColor(cat.color || '#FF8F00');
    setIsAddingCategory(true);
  };

  const handleStartEditTag = (t: TagItem) => {
    setEditingTag(t);
    setTagName(t.name);
    setIsAddingTag(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setErrorMessage(null);

    try {
      if (editingCategory) {
        const isUnchanged =
          catName.trim() === (editingCategory.name || '').trim() &&
          catDescription.trim() === (editingCategory.description || '').trim() &&
          catColor === (editingCategory.color || '#E58A00');
        if (isUnchanged) {
          resetCategoryForm();
          return;
        }
        await put(`/api/category/${editingCategory.id}`, {
          name: catName.trim(),
          description: catDescription.trim(),
          color: catColor
        });
        setStatusMessage('Category updated successfully');
      } else {
        await post('/api/category', {
          name: catName.trim(),
          description: catDescription.trim(),
          color: catColor
        });
        setStatusMessage('New channel created successfully');
      }

      resetCategoryForm();
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error saving category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await del(`/api/category/${id}`);
      setStatusMessage('Category removed');
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error deleting category');
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    setErrorMessage(null);

    try {
      if (editingTag) {
        if (tagName.trim() === (editingTag.name || '').trim()) {
          resetTagForm();
          return;
        }
        const tagId = editingTag.id || editingTag._id;
        await put(`/api/tag/${tagId}`, { name: tagName.trim() });
        setStatusMessage('Tag updated successfully');
      } else {
        await post('/api/tag', { name: tagName.trim() });
        setStatusMessage('New tag created successfully');
      }

      resetTagForm();
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error saving tag');
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tag "${name}"?`)) return;

    try {
      await del(`/api/tag/${id}`);
      setTags(prev => prev.filter(t => (t.id || t._id) !== id));
      setStatusMessage('Tag removed');
      router.refresh();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error deleting tag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & navigation row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#343131]">
            Content Taxonomy & Governance
          </h2>
          <p className="text-xs text-[#6B6661] mt-0.5">
            Manage editorial categories, channels, and indexing tags for discovery across the enterprise.
          </p>
        </div>

        {/* Tab & Add Button */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF]">
            <button
              type="button"
              onClick={() => { setActiveTab('categories'); resetCategoryForm(); resetTagForm(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${activeTab === 'categories'
                ? 'bg-white text-[#343131] shadow-2xs font-bold'
                : 'text-[#6B6661] hover:text-[#343131]'
                }`}
            >
              <Folder className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('tags'); resetCategoryForm(); resetTagForm(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${activeTab === 'tags'
                ? 'bg-white text-[#343131] shadow-2xs font-bold'
                : 'text-[#6B6661] hover:text-[#343131]'
                }`}
            >
              <Hash className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Tags ({initialTags.length})</span>
            </button>
          </div>

          {activeTab === 'categories' ? (
            <button
              type="button"
              onClick={() => { resetCategoryForm(); setIsAddingCategory(!isAddingCategory); }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{isAddingCategory ? 'Cancel' : 'New Category'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { resetTagForm(); setIsAddingTag(!isAddingTag); }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingTag ? 'Cancel' : 'New Tag'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CATEGORIES SECTION */}
      {activeTab === 'categories' && (
        <>
          {/* Creation / Edit Form Card for Category */}
          {isAddingCategory && (
            <div className="p-6 rounded-2xl bg-white border border-[#FFB22C] shadow-sm animate-in fade-in space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#343131]">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Editorial Category'}
              </h3>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
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
                        value={catColor}
                        onChange={e => setCatColor(e.target.value)}
                        className="w-10 h-9 p-0.5 border border-[#EAE6DF] rounded-lg cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={catColor}
                        onChange={e => setCatColor(e.target.value)}
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
                    value={catDescription}
                    onChange={e => setCatDescription(e.target.value)}
                    placeholder="What topics fall under this discipline?"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-4 py-2 text-xs rounded-xl border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors cursor-pointer"
                  >
                    {isLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
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
                          onClick={() => handleStartEditCategory(cat)}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#FF8F00] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        </>
      )}

      {/* TAGS SECTION */}
      {activeTab === 'tags' && (
        <>
          {/* Creation / Edit Form Card for Tag */}
          {isAddingTag && (
            <div className="p-6 rounded-2xl bg-white border border-[#FFB22C] shadow-sm animate-in fade-in space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#343131]">
                {editingTag ? `Edit Tag: #${editingTag.name}` : 'Create New Tag'}
              </h3>

              <form onSubmit={handleTagSubmit} className="space-y-4">
                <div className="max-w-md">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={e => setTagName(e.target.value)}
                    placeholder="e.g. Next.js, Architecture, Security"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
                  />
                </div>

                <div className="flex justify-start space-x-2">
                  <button
                    type="button"
                    onClick={resetTagForm}
                    className="px-4 py-2 text-xs rounded-xl border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors cursor-pointer"
                  >
                    {isLoading ? 'Saving...' : editingTag ? 'Update Tag' : 'Save Tag'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tags Table */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#6B6661] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAE6DF]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Tag Name</th>
                  <th scope="col" className="px-5 py-3.5">Slug</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Associated Stories</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#96918B]">
                      No tags found. Click &quot;New Tag&quot; or tags will be created automatically when publishing stories.
                    </td>
                  </tr>
                ) : (
                  tags.map(tag => {
                    const tagId = tag.id || tag._id || '';
                    return (
                      <tr key={tagId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#343131]">
                            #{tag.name}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-[#6B6661] font-mono text-[11px]">
                          /{tag.slug}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] font-semibold text-[11px]">
                            {tag.postCount || 0}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditTag(tag)}
                              className="p-1.5 rounded-lg border border-[#EAE6DF] text-[#6B6661] hover:text-[#FF8F00] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                              title="Edit Tag"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTag(tagId, tag.name)}
                              className="p-1.5 rounded-lg border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Tag"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
