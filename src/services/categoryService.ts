import mongoose from 'mongoose';
import { Category, Blog } from '@/models';
import { connectDB } from '@/lib/db';
import { Category as CategoryType } from '@/types';
import { slugify } from '@/lib/util';

export async function getAllCategories(): Promise<(CategoryType & { postCount: number })[]> {
  await connectDB();
  const [categories, blogCounts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>();
  for (const item of blogCounts) {
    if (item._id) {
      countMap.set(item._id.toString(), item.count || 0);
    }
  }

  return categories.map((cat: any) => ({
    id: cat._id.toString(),
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug || slugify(cat.name),
    description: cat.description || `Articles and insights in ${cat.name}.`,
    color: cat.color || '#FF8F00',
    postCount: countMap.get(cat._id.toString()) || 0,
    createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : '',
    updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : '',
  }));
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return Category.findOne({ slug });
}

export async function getCategoryById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  return Category.findById(id);
}

export async function createCategory(data: { name: string; slug?: string; description?: string; color?: string }) {
  await connectDB();
  const name = data.name.trim();
  const slug = data.slug?.trim() || slugify(name);

  const existing = await Category.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { slug }],
  });
  if (existing) {
    return existing;
  }

  const category = new Category({
    name,
    slug,
    description: data.description?.trim() || '',
    color: data.color || '#FF8F00',
  });
  await category.save();
  return category;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string; color?: string }) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const updates: any = {};
  if (data.name) {
    updates.name = data.name.trim();
    updates.slug = data.slug ? data.slug.trim() : slugify(data.name);
  }
  if (data.description !== undefined) updates.description = data.description.trim();
  if (data.color !== undefined) updates.color = data.color;

  return Category.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteCategory(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return false;
  await Category.findByIdAndDelete(id);
  return true;
}

export const categoryService = {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
