'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Category } from '@/types';
import { Badge } from '@/components/common/Badge';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/axios';
import {
  Save,
  Trash2,
  ArrowLeft,
  Tag,
  AlertCircle,
  CheckCircle2,
  Plus,
  Send,
  Loader2
} from 'lucide-react';

import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to prevent SSR window issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-[#FAF8F5] text-xs text-[#96918B] rounded-2xl border border-[#EAE6DF]">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#FF8F00]" />
      <span>Loading rich text editor...</span>
    </div>
  ),
});

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
];

interface ArticleEditorProps {
  initialPost?: any;
  categories: Category[];
  isEditing?: boolean;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialPost,
  categories: initialCategories,
  isEditing = false
}) => {
  const router = useRouter();

  const [categoryList, setCategoryList] = useState<any[]>(initialCategories || []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [categoryId, setCategoryId] = useState(
    initialPost?.category?._id || initialPost?.category || initialPost?.categoryId || categoryList[0]?.id || categoryList[0]?._id || ''
  );
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || ['Engineering', 'Tech']);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status === 'published' ? 'published' : 'draft');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { post, put, del } = useApi();

  // Load latest categories from API
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient.get('/api/category');
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setCategoryList(list);
          if (!categoryId) {
            setCategoryId(list[0]._id || list[0].id);
          }
        }
      } catch {
        // Fallback to initialCategories
      }
    }
    loadCategories();
  }, []);

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    setErrorMessage(null);

    try {
      const created = await post('/api/category', { name: newCategoryName.trim() });
      if (created) {
        const newCat = {
          id: created._id || created.id,
          _id: created._id || created.id,
          name: created.name,
          slug: created.slug
        };
        setCategoryList(prev => [...prev, newCat]);
        setCategoryId(newCat._id);
        setNewCategoryName('');
        setIsAddingCategory(false);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation 1: Title
    if (!title.trim() || title.trim().length < 2) {
      setErrorMessage('Please provide a valid story title (at least 2 characters).');
      return;
    }

    // Validation 2: Content (strip HTML tags to check text content)
    const strippedContent = content.replace(/<(.|\n)*?>/g, '').trim();
    if (!strippedContent && !content.includes('<img')) {
      setErrorMessage('Story content cannot be empty. Please write your article body.');
      return;
    }

    // Validation 3: Category
    if (!categoryId) {
      setErrorMessage('Please select or create a category for your story.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        content,
        category: categoryId,
        coverImage,
        tags,
        status: targetStatus,
      };

      const postId = initialPost?._id || initialPost?.id;
      if (isEditing && postId) {
        await put(`/api/blog/${postId}`, payload);
      } else {
        await post('/api/blog', payload);
      }

      setStatus(targetStatus);
      setSuccessMessage(
        targetStatus === 'published'
          ? 'Story published successfully!'
          : 'Draft saved successfully.'
      );

      setTimeout(() => {
        router.push('/studio');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error saving story');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialPost) return;
    if (!confirm('Are you sure you want to delete this story?')) return;

    const postId = initialPost?._id || initialPost?.id;
    try {
      await del(`/api/blog/${postId}`);
      router.push('/studio');
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error deleting story');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE6DF]">
        <div className="flex items-center space-x-3">
          <Link
            href="/studio"
            className="p-2 rounded-xl border border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#6B6661] hover:text-[#343131] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#343131]">
              {isEditing ? 'Edit Story' : 'New Story'}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-[#6B6661] mt-0.5">
              <span>Status:</span>
              <Badge status={status} size="sm" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Draft vs Publish */}
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              title="Delete story"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#6B6661]" />
            <span>{isSaving && status === 'draft' ? 'Saving...' : 'Save as Draft'}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving && status === 'published' ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Validation / Status Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Title & Quill Rich Textarea */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title Input */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-2xs">
            <input
              type="text"
              required
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Title of your story..."
              className="w-full font-serif text-2xl sm:text-3xl font-bold text-[#343131] placeholder-[#C2BCB3] border-none focus:outline-none bg-transparent"
            />
          </div>

          {/* Quill Rich Text Editor */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden p-6 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] mb-2">
              Story Body (Rich Text)
            </label>
            <div className="prose-editor min-h-[350px]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={val => {
                  setContent(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your story here with rich text formatting, headings, bullet lists, code blocks, or links..."
                className="bg-white rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Category Selector with Add New & Cover Image */}
        <div className="lg:col-span-4 space-y-5">
          {/* Category Selector with Inline Add Field */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#343131]">
                Discipline / Category
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] font-semibold text-[#FF8F00] hover:text-[#D47400] flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingCategory ? 'Cancel' : ' New Category'}</span>
              </button>
            </div>

            {/* Dropdown Select */}
            <select
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer"
            >
              <option value="">-- Select a Category --</option>
              {categoryList.map(cat => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Inline Add Category Input */}
            {isAddingCategory && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF] space-y-2 animate-in fade-in">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6661]">
                  New Category Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. AI & Machine Learning"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#EAE6DF] rounded-lg text-[#343131] focus:outline-none focus:ring-1 focus:ring-[#FFB22C]"
                  />
                  <button
                    type="button"
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    onClick={handleAddNewCategory}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingCategory ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cover Image Picker */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-4">
            <ImageUpload
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Editorial Cover Image"
              helperText="Upload image (PNG/JPG/WebP) or provide an image link."
            />
          </div>

          {/* Tags Input */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Tags</span>
            </label>

            <input
              type="text"
              placeholder="Type tag and press Enter..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[11px] font-medium bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-0.5 rounded-full text-[#44403c]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-[#96918B] hover:text-rose-600 focus:outline-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
