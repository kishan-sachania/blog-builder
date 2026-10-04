import { Blog } from "../../models/blog/blog";
import { User } from "../../models/user";
import { Category } from "../../models/category/category";
import { Tag } from "../../models/tag/tag";

// Reference models so Mongoose registers them for population
void User;
void Category;
void Tag;

export interface GetBlogsOptions {
  page?: number;
  limit?: number;
  status?: string;
  author?: string;
  category?: string;
  search?: string;
}

const getBlogs = async (options: GetBlogsOptions = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

  const query: any = {};
  if (options.status && options.status !== "all") {
    query.status = options.status;
  }
  if (options.author) {
    query.author = options.author;
  }
  if (options.category && options.category !== "all") {
    query.category = options.category;
  }
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: "i" } },
      { content: { $regex: options.search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Blog.find(query)
      .populate("author", "name email avatar")
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getBlogById = async (id: string) => {
  return Blog.findById(id)
    .populate("author", "name email avatar")
    .populate("category", "name slug")
    .populate("tags", "name slug");
};

const getUserBlogs = async (userId: string, options: GetBlogsOptions = {}) => {
  return getBlogs({ ...options, author: userId });
};

async function resolveTagIds(tagsInput: any[]): Promise<any[]> {
  if (!Array.isArray(tagsInput)) return [];
  const tagIds: any[] = [];
  for (const item of tagsInput) {
    if (!item) continue;
    if (typeof item === "string" && /^[0-9a-fA-F]{24}$/.test(item)) {
      tagIds.push(item);
    } else if (typeof item === "string") {
      const trimmed = item.trim().replace(/^#/, "");
      if (!trimmed) continue;
      const slug = trimmed
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
      const tagDoc = await Tag.findOneAndUpdate(
        { $or: [{ slug }, { name: { $regex: new RegExp(`^${trimmed}$`, "i") } }] },
        { name: trimmed, slug },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      if (tagDoc) tagIds.push(tagDoc._id);
    } else if (item?._id) {
      tagIds.push(item._id);
    }
  }
  return tagIds;
}

const createBlog = async (body: any) => {
  if (body.tags) {
    body.tags = await resolveTagIds(body.tags);
  }
  const blog = new Blog(body);
  await blog.save();
  return blog;
};

const updateBlog = async (id: string, updates: any) => {
  if (updates.tags) {
    updates.tags = await resolveTagIds(updates.tags);
  }
  const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
  if (!blog) {
    throw new Error("Blog not found");
  }
  return blog;
};

const deleteBlog = async (id: string) => {
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) {
    throw new Error("Blog not found");
  }
  return blog;
};

const incrementBlogViews = async (id: string) => {
  return Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};

export {
  getBlogs,
  getBlogById,
  getUserBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementBlogViews,
  resolveTagIds,
};