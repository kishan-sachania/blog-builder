import mongoose from 'mongoose';
import { Tag, Blog } from '@/models';
import { connectDB } from '@/lib/db';
import { slugify } from '@/lib/util';
import { Tag as TagType } from '@/types';

export async function getAllTags(): Promise<(TagType & { postCount: number })[]> {
  await connectDB();
  const [tags, blogCounts] = await Promise.all([
    Tag.find().sort({ name: 1 }).lean(),
    Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>();
  for (const item of blogCounts) {
    if (item._id) {
      countMap.set(item._id.toString(), item.count || 0);
    }
  }

  return tags.map((t: any) => ({
    id: t._id.toString(),
    _id: t._id.toString(),
    name: t.name,
    slug: t.slug || slugify(t.name),
    postCount: countMap.get(t._id.toString()) || 0,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : '',
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : '',
  }));
}

export async function getTagById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  return Tag.findById(id);
}

export async function createTag(data: { name: string; slug?: string }) {
  await connectDB();
  const name = data.name.trim();
  const slug = data.slug?.trim() || slugify(name);

  const existing = await Tag.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { slug }],
  });
  if (existing) {
    return existing;
  }

  const tag = new Tag({ name, slug });
  await tag.save();
  return tag;
}

export async function updateTag(id: string, data: { name?: string; slug?: string }) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const updates: any = {};
  if (data.name) {
    updates.name = data.name.trim();
    updates.slug = data.slug ? data.slug.trim() : slugify(data.name);
  }
  return Tag.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteTag(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return false;
  await Tag.findByIdAndDelete(id);
  return true;
}

export const tagService = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
