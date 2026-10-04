import { Category } from "../../models/category/category";
import { Blog } from "../../models/blog/blog";
import { connectDB } from "@/lib/db";
import { Category as CategoryType } from "@/types";
import { slugify } from "@/lib/util";

export const categoryService = {
  async getAllCategories(): Promise<(CategoryType & { postCount: number })[]> {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat: any) => {
        const count = await Blog.countDocuments({ category: cat._id });
        return {
          id: cat._id.toString(),
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug || slugify(cat.name),
          description: cat.description || `Articles and insights in ${cat.name}.`,
          color: cat.color || '#FF8F00',
          postCount: count,
          createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : '',
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : '',
        };
      })
    );

    return categoriesWithCount;
  },

  async getCategoryBySlug(slug: string) {
    await connectDB();
    return Category.findOne({ slug });
  },

  async getCategoryById(id: string) {
    await connectDB();
    return Category.findById(id);
  },

  async createCategory(data: { name: string; slug?: string }) {
    await connectDB();
    const name = data.name.trim();
    const slug = data.slug?.trim() || slugify(name);

    const existing = await Category.findOne({
      $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { slug }],
    });
    if (existing) {
      return existing;
    }

    const category = new Category({ name, slug });
    await category.save();
    return category;
  },

  async updateCategory(id: string, data: { name?: string; slug?: string }) {
    await connectDB();
    const updates: any = {};
    if (data.name) {
      updates.name = data.name.trim();
      updates.slug = data.slug ? data.slug.trim() : slugify(data.name);
    }
    return Category.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteCategory(id: string) {
    await connectDB();
    await Category.findByIdAndDelete(id);
    return true;
  },
};
