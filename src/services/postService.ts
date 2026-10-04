import { Post } from '@/types';
import { Blog } from '../../models/blog/blog';
import { User } from '../../models/user';
import { Category } from '../../models/category/category';
import { Tag } from '../../models/tag/tag';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { resolveTagIds } from './blogServices';

// register models for population
void User;
void Category;
void Tag;

export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function formatBlogPost(doc: any): Post {
  const plain = doc.toObject ? doc.toObject() : doc;
  const rawContent = plain.content || '';
  const stripped = extractPlainText(rawContent);
  const excerpt = stripped.length > 160 ? stripped.slice(0, 160).trim() + '...' : stripped;

  const author = plain.author || {};
  const category = plain.category || {};
  const tags = Array.isArray(plain.tags)
    ? plain.tags.map((t: any) => (typeof t === 'object' && t?.name ? t.name : String(t)))
    : [];

  return {
    id: plain._id.toString(),
    slug: plain._id.toString(),
    title: plain.title || 'Untitled Story',
    excerpt,
    content: rawContent,
    coverImage: plain.coverImage || '',
    categoryId: category._id ? category._id.toString() : (category.id || String(category || '')),
    categoryName: category.name || 'General',
    tags,
    authorId: author._id ? author._id.toString() : (author.id || String(author || '')),
    authorName: author.name || 'Editorial Team',
    authorTitle: author.title || 'Staff Writer',
    authorAvatar: author.avatar || '',
    status: (plain.status === 'published' ? 'published' : 'draft') as any,
    viewCount: plain.views || 0,
    featured: false,
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : new Date().toISOString(),
    publishedAt: plain.status === 'published' ? (plain.updatedAt || plain.createdAt) : undefined,
  };
}

export const postService = {
  async getAllPosts(filters?: {
    status?: string;
    authorId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<Post[]> {
    await connectDB();
    const query: any = {};

    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    if (filters?.authorId) {
      if (mongoose.Types.ObjectId.isValid(filters.authorId)) {
        query.author = filters.authorId;
      } else {
        return [];
      }
    }
    if (filters?.categoryId && filters.categoryId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(filters.categoryId)) {
        query.category = filters.categoryId;
      }
    }
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 });

    return blogs.map(formatBlogPost);
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(slug)) {
      const blog = await Blog.findById(slug)
        .populate('author', 'name email avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug');
      if (blog) return formatBlogPost(blog);
    }

    return null;
  },

  async getPostById(id: string): Promise<Post | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const blog = await Blog.findById(id)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    if (!blog) return null;
    return formatBlogPost(blog);
  },

  async createPost(postData: Partial<Post>): Promise<Post> {
    await connectDB();
    const resolvedTags = postData.tags ? await resolveTagIds(postData.tags) : [];
    const blog = new Blog({
      title: postData.title,
      content: postData.content,
      author: postData.authorId,
      category: postData.categoryId,
      coverImage: postData.coverImage || '',
      status: postData.status || 'draft',
      tags: resolvedTags,
    });
    await blog.save();
    return formatBlogPost(await blog.populate(['author', 'category', 'tags']));
  },

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    await connectDB();
    const updatePayload: any = {};
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.categoryId !== undefined) updatePayload.category = updates.categoryId;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.coverImage !== undefined) updatePayload.coverImage = updates.coverImage;
    if (updates.tags !== undefined) {
      updatePayload.tags = await resolveTagIds(updates.tags);
    }

    const blog = await Blog.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!blog) {
      throw new Error('Post not found');
    }
    return formatBlogPost(blog);
  },

  async deletePost(id: string): Promise<boolean> {
    await connectDB();
    await Blog.findByIdAndDelete(id);
    return true;
  },

  async moderatePost(id: string, action: string): Promise<Post> {
    await connectDB();
    const status = action === 'approved' ? 'published' : 'draft';
    const blog = await Blog.findByIdAndUpdate(id, { status }, { new: true })
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!blog) {
      throw new Error('Post not found');
    }
    return formatBlogPost(blog);
  },
};
