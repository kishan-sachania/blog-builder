import { Blog } from "../../models/blog/blog"

const getBlogs = async () => {
    return Blog.find()
}

const getBlogById = async (id: string) => {
    return Blog.findById(id).populate("author", "name email").populate("category", "name slug");
};

const getUserBlogs = async (userId: string) => {
    return Blog.find({ author: userId }).sort({ createdAt: -1 });
}

const createBlog = async (body: any) => {
    const blog = new Blog(body)
    await blog.save()
    return blog
}

const updateBlog = async (id: string, updates: any) => {
    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    if (!blog) {
        throw new Error("Blog not found")
    }
    return blog
}

const deleteBlog = async (id: string) => {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
        throw new Error("Blog not found")
    }
    return blog
}

export { getBlogs,getBlogById, getUserBlogs, createBlog, updateBlog, deleteBlog }