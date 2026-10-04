import { PlatformAnalytics } from '@/types';
import { Blog } from '../../models/blog/blog';
import { User } from '../../models/user';
import { Category } from '../../models/category/category';
import { connectDB } from '@/lib/db';
import { extractPlainText } from './postService';

export const analyticsService = {
  async getAnalytics(): Promise<PlatformAnalytics> {
    await connectDB();

    const [
      totalStories,
      publishedStories,
      draftsCount,
      activeAuthors,
      categories,
      recentBlogs,
      viewsAggregation,
      mostActiveAuthorAgg,
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      User.countDocuments(),
      Category.find().lean(),
      Blog.find()
        .populate('author', 'name email avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$author', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const totalViews = viewsAggregation[0]?.totalViews || 0;

    let mostActiveEmployee = null;
    if (mostActiveAuthorAgg.length > 0 && mostActiveAuthorAgg[0]._id) {
      const authorUser = await User.findById(mostActiveAuthorAgg[0]._id).lean();
      if (authorUser) {
        mostActiveEmployee = {
          id: (authorUser as any)._id.toString(),
          name: (authorUser as any).name || 'Unknown',
          email: (authorUser as any).email || '',
          avatar: (authorUser as any).avatar || '',
          publishedCount: mostActiveAuthorAgg[0].count,
          views: mostActiveAuthorAgg[0].totalViews || 0,
        };
      }
    }

    const categoryBreakdown = await Promise.all(
      categories.map(async (cat: any) => {
        const count = await Blog.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          count,
        };
      })
    );

    const recentSubmissions = recentBlogs.map((b: any) => ({
      id: b._id.toString(),
      slug: b._id.toString(),
      title: b.title || 'Untitled',
      excerpt: extractPlainText(b.content || '').slice(0, 100),
      content: b.content || '',
      coverImage: b.coverImage || '',
      categoryId: b.category?._id?.toString() || '',
      categoryName: b.category?.name || 'General',
      tags: [],
      authorId: b.author?._id?.toString() || '',
      authorName: b.author?.name || 'Author',
      authorTitle: 'Writer',
      authorAvatar: b.author?.avatar || '',
      status: b.status || 'draft',
      viewCount: b.views || 0,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return {
      totalStories,
      publishedStories,
      pendingReviews: 0,
      activeAuthors,
      totalViews,
      draftsCount,
      categoryBreakdown,
      recentSubmissions: recentSubmissions as any,
      recentLogs: [],
      mostActiveEmployee,
    };
  },
};
