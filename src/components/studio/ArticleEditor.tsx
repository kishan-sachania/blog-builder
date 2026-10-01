'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Post, Category } from '@/types';
import { Badge } from '@/components/common/Badge';
import {
  Save,
  Send,
  Trash2,
  ArrowLeft,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Code,
  List,
  Eye,
  Edit3,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ArticleEditorProps {
  initialPost?: Post;
  categories: Category[];
  isEditing?: boolean;
}

const PRESET_COVERS = [
  {
    name: 'Architecture & Design',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Servers & Infrastructure',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Team & Collaboration',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Future & Neural',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Data & Telemetry',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200'
  }
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialPost,
  categories,
  isEditing = false
}) => {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [categoryId, setCategoryId] = useState(initialPost?.categoryId || categories[0]?.id || '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || ['Engineering', 'Architecture']);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState(initialPost?.status || 'draft');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate live stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Toolbar markdown injector
  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
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

  const handleSave = async (targetStatus: 'draft' | 'in_review') => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your story before saving.');
      return;
    }

    setErrorMessage(null);
    if (targetStatus === 'in_review') {
      setIsSubmitting(true);
    } else {
      setIsSaving(true);
    }

    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || title.trim(),
        content,
        coverImage,
        categoryId,
        tags,
        status: targetStatus
      };

      const url = isEditing ? `/api/posts/${initialPost?.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save story');
      }

      setStatus(targetStatus);
      setSuccessMessage(
        targetStatus === 'in_review'
          ? 'Story submitted to editorial moderation queue!'
          : 'Draft saved successfully.'
      );

      setTimeout(() => {
        router.push('/studio');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error saving story');
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialPost) return;
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const res = await fetch(`/api/posts/${initialPost.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      router.push('/studio');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting story');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top action bar */}
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
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{estimatedReadingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl border border-[#EAE6DF] text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
              title="Delete story"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isSaving || isSubmitting}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#6B6661]" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={isSaving || isSubmitting}
            onClick={() => handleSave('in_review')}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Editorial Feedback alert if rejected */}
      {initialPost?.editorialNotes && initialPost.status === 'rejected' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
          <div className="flex items-center space-x-2 font-semibold text-xs text-amber-950">
            <AlertCircle className="w-4 h-4 text-[#FF8F00]" />
            <span>Editorial Reviewer Notes:</span>
          </div>
          <p className="text-xs text-amber-900 pl-6 italic">
            &ldquo;{initialPost.editorialNotes}&rdquo;
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Editor column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title Input */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-3">
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title of your story..."
              className="w-full font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#343131] placeholder-[#C2BCB3] border-none focus:outline-none bg-transparent"
            />

            <input
              type="text"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Write a clear subtitle or executive summary..."
              className="w-full text-sm sm:text-base text-[#6B6661] placeholder-[#C2BCB3] border-none focus:outline-none bg-transparent"
            />
          </div>

          {/* Formatting & Content Area */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
            {/* Toolbar Header */}
            <div className="p-3 bg-[#FAF8F5] border-b border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ', '')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-[#EAE6DF] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-[#EAE6DF] mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Quote Block"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```typescript\n', '\n```')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 rounded-lg hover:bg-white text-[#6B6661] hover:text-[#343131] transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Write vs Preview Toggle */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#EAE6DF] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
                    activeTab === 'write'
                      ? 'bg-[#343131] text-white'
                      : 'text-[#6B6661] hover:text-[#343131]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
                    activeTab === 'preview'
                      ? 'bg-[#343131] text-white'
                      : 'text-[#6B6661] hover:text-[#343131]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Textarea or Preview body */}
            <div className="p-6">
              {activeTab === 'write' ? (
                <textarea
                  id="content-textarea"
                  rows={20}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tell your story. Use markdown for headings (##), quotes (>), or code blocks (```)..."
                  className="w-full text-base sm:text-lg text-[#343131] placeholder-[#C2BCB3] leading-relaxed resize-y focus:outline-none font-sans"
                />
              ) : (
                <div className="prose-editorial max-w-none min-h-[400px]">
                  {content.trim() ? (
                    <div className="space-y-4">
                      {content.split('\n\n').map((para, i) => {
                        if (para.startsWith('## ')) {
                          return <h2 key={i} className="font-serif text-2xl font-bold mt-6">{para.replace('## ', '')}</h2>;
                        }
                        if (para.startsWith('### ')) {
                          return <h3 key={i} className="font-serif text-xl font-bold mt-4">{para.replace('### ', '')}</h3>;
                        }
                        if (para.startsWith('> ')) {
                          return (
                            <blockquote key={i} className="pl-4 border-l-4 border-[#FF8F00] font-serif italic text-lg text-stone-700 bg-[#FAF3E0]/40 py-2">
                              {para.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        if (para.startsWith('```')) {
                          return (
                            <pre key={i} className="p-4 bg-stone-900 text-stone-100 rounded-lg text-xs font-mono">
                              <code>{para.replace(/```[a-z]*\n?/g, '')}</code>
                            </pre>
                          );
                        }
                        return <p key={i} className="text-base text-[#343131] leading-relaxed">{para}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#96918B] italic">No content written yet. Switch back to Write mode to craft your story.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Metadata & Settings */}
        <div className="lg:col-span-4 space-y-5">
          {/* Category Selector */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#343131]">
              Discipline / Category
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Picker */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#343131] flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF8F00]" />
                <span>Editorial Cover Image</span>
              </label>
            </div>

            {/* Current Selected Cover Preview */}
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-[#EAE6DF] border border-[#EAE6DF]">
              <Image
                src={coverImage}
                alt="Selected cover preview"
                fill
                sizes="300px"
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Curated Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#6B6661]">Curated Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COVERS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className={`p-1.5 rounded-lg border text-[10px] text-left transition-all ${
                      coverImage === preset.url
                        ? 'border-[#FF8F00] bg-[#FAF3E0] font-bold text-[#8C5D00]'
                        : 'border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#6B6661]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL */}
            <div className="pt-2 border-t border-[#EAE6DF] space-y-2">
              <span className="text-[11px] font-semibold text-[#6B6661]">Or Custom Image URL:</span>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customCoverUrl}
                  onChange={e => setCustomCoverUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-[#343131] focus:outline-none focus:ring-1 focus:ring-[#FFB22C]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCoverUrl.trim()) {
                      setCoverImage(customCoverUrl.trim());
                      setCustomCoverUrl('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#FAF3E0] text-[#8C5D00] hover:bg-[#FFB22C] rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
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
                    className="ml-1.5 text-[#96918B] hover:text-rose-600 focus:outline-none"
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
