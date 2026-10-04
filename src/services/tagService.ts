import { Tag } from "../../models/tag/tag";
import { Blog } from "../../models/blog/blog";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/util";

export const tagService = {
  async getAllTags(): Promise<any[]> {
    await connectDB();
    const tags = await Tag.find().sort({ name: 1 }).lean();

    const tagsWithCount = await Promise.all(
      tags.map(async (t: any) => {
        const count = await Blog.countDocuments({ tags: t._id });
        return {
          id: t._id.toString(),
          _id: t._id.toString(),
          name: t.name,
          slug: t.slug || slugify(t.name),
          postCount: count,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : "",
          updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : "",
        };
      })
    );

    return tagsWithCount;
  },

  async getTagById(id: string) {
    await connectDB();
    return Tag.findById(id);
  },

  async createTag(data: { name: string; slug?: string }) {
    await connectDB();
    const name = data.name.trim();
    const slug = data.slug?.trim() || slugify(name);

    const existing = await Tag.findOne({
      $or: [{ name: { $regex: new RegExp(`^${name}$`, "i") } }, { slug }],
    });
    if (existing) {
      return existing;
    }

    const tag = new Tag({ name, slug });
    await tag.save();
    return tag;
  },

  async updateTag(id: string, data: { name?: string; slug?: string }) {
    await connectDB();
    const updates: any = {};
    if (data.name) {
      updates.name = data.name.trim();
      updates.slug = data.slug ? data.slug.trim() : slugify(data.name);
    }
    return Tag.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteTag(id: string) {
    await connectDB();
    await Tag.findByIdAndDelete(id);
    return true;
  },
};
