import mongoose from 'mongoose';
import { Blog, Tag } from '@/models';
import { connectDB } from '@/lib/db';
import { Post } from '@/types';

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&mdash;': '—',
  '&ndash;': '–',
};

export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>|<script[^>]*>[\s\S]*?<\/script>|<[^>]+>/gi, ' ')
    .replace(/&[a-z0-9#]+;/gi, (entity) => {
      const lower = entity.toLowerCase();
      if (HTML_ENTITY_MAP[lower]) return HTML_ENTITY_MAP[lower];
      if (lower.startsWith('&#x')) return String.fromCharCode(parseInt(lower.slice(3, -1), 16)) || entity;
      if (lower.startsWith('&#')) return String.fromCharCode(parseInt(lower.slice(2, -1), 10)) || entity;
      return entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatBlogPost(doc: any): Post {
  const plain = doc?.toObject ? doc.toObject() : doc || {};
  const rawContent = plain.content || '';
  const stripped = extractPlainText(rawContent);
  const excerpt = stripped.length > 160 ? `${stripped.slice(0, 160).trim()}...` : stripped;

  const author = plain.author || {};
  const category = plain.category || {};
  const tags = Array.isArray(plain.tags)
    ? plain.tags.map((t: any) => (typeof t === 'object' && t?.name ? t.name : String(t || '')))
    : [];

  return {
    id: plain._id?.toString() || plain.id || '',
    slug: plain._id?.toString() || plain.id || '',
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
    status: plain.status || 'draft',
    viewCount: plain.views || 0,
    featured: false,
    editorialNotes: plain.editorialNotes || '',
    submittedAt: plain.submittedAt ? new Date(plain.submittedAt).toISOString() : undefined,
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : new Date().toISOString(),
    publishedAt: plain.status === 'published' ? (plain.updatedAt || plain.createdAt) : undefined,
  };
}

export async function resolveTagIds(tagsInput: any[]): Promise<mongoose.Types.ObjectId[]> {
  if (!Array.isArray(tagsInput)) return [];
  const tagIds: mongoose.Types.ObjectId[] = [];

  for (const item of tagsInput) {
    if (!item) continue;
    if (typeof item === 'string' && mongoose.isValidObjectId(item)) {
      tagIds.push(new mongoose.Types.ObjectId(item));
    } else if (typeof item === 'string') {
      const trimmed = item.trim().replace(/^#/, '');
      if (!trimmed) continue;
      const slug = trimmed
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');

      const tagDoc = await Tag.findOneAndUpdate(
        { $or: [{ slug }, { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }] },
        { name: trimmed, slug },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      if (tagDoc) tagIds.push(tagDoc._id);
    } else if (item?._id && mongoose.isValidObjectId(item._id)) {
      tagIds.push(new mongoose.Types.ObjectId(item._id));
    }
  }

  return tagIds;
}

export interface GetBlogsOptions {
  page?: number;
  limit?: number;
  status?: string;
  author?: string;
  authorId?: string;
  category?: string;
  categoryId?: string;
  search?: string;
}

export async function getBlogs(options: GetBlogsOptions = {}) {
  await connectDB();
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

  const query: any = {};
  const status = options.status;
  if (status && status !== 'all') {
    query.status = status;
  }

  const author = options.author || options.authorId;
  if (author && mongoose.isValidObjectId(author)) {
    query.author = author;
  }

  const category = options.category || options.categoryId;
  if (category && category !== 'all' && mongoose.isValidObjectId(category)) {
    query.category = category;
  }

  if (options.search?.trim()) {
    const searchRegex = { $regex: options.search.trim(), $options: 'i' };
    query.$or = [{ title: searchRegex }, { content: searchRegex }];
  }

  const [items, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'name email avatar title department')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getAllPosts(filters: GetBlogsOptions = {}): Promise<Post[]> {
  await connectDB();
  const query: any = {};

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  const author = filters.author || filters.authorId;
  if (author && mongoose.isValidObjectId(author)) {
    query.author = author;
  }
  const category = filters.category || filters.categoryId;
  if (category && category !== 'all' && mongoose.isValidObjectId(category)) {
    query.category = category;
  }
  if (filters.search?.trim()) {
    const searchRegex = { $regex: filters.search.trim(), $options: 'i' };
    query.$or = [{ title: searchRegex }, { content: searchRegex }];
  }

  const blogs = await Blog.find(query)
    .populate('author', 'name email avatar title department')
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .sort({ createdAt: -1 });

  return blogs.map(formatBlogPost);
}

export async function getBlogById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  return Blog.findById(id)
    .populate('author', 'name email avatar title department')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');
}

export async function getPostById(id: string): Promise<Post | null> {
  const blog = await getBlogById(id);
  if (!blog) return null;
  return formatBlogPost(blog);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return getPostById(slug);
}

export async function createBlog(body: any) {
  await connectDB();
  if (body.tags) {
    body.tags = await resolveTagIds(body.tags);
  }
  const blog = new Blog(body);
  await blog.save();
  return blog;
}

export async function updateBlog(id: string, updates: any) {
  await connectDB();
  if (updates.tags) {
    updates.tags = await resolveTagIds(updates.tags);
  }
  const blog = await Blog.findByIdAndUpdate(id, updates, { new: true })
    .populate('author', 'name email avatar title department')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  if (!blog) {
    throw new Error('Blog not found');
  }
  return blog;
}

export async function deleteBlog(id: string) {
  await connectDB();
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) {
    throw new Error('Blog not found');
  }
  return blog;
}

export async function incrementBlogViews(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  return Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
}

export const blogService = {
  getBlogs,
  getAllPosts,
  getBlogById,
  getPostById,
  getPostBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementBlogViews,
  resolveTagIds,
  extractPlainText,
  formatBlogPost,
};
