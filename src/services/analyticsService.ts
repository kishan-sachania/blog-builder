import { Blog, User, Category } from '@/models';
import { connectDB } from '@/lib/db';
import { PlatformAnalytics } from '@/types';
import { formatBlogPost } from './blogService';

export async function getAnalytics(): Promise<PlatformAnalytics> {
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
    categoryCounts,
  ] = await Promise.all([
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    Blog.countDocuments({ status: 'draft' }),
    User.countDocuments(),
    Category.find().lean(),
    Blog.find()
      .populate('author', 'name email avatar title department')
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
    Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
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

  const categoryCountMap = new Map<string, number>();
  for (const cc of categoryCounts) {
    if (cc._id) categoryCountMap.set(cc._id.toString(), cc.count || 0);
  }

  const categoryBreakdown = categories.map((cat: any) => ({
    name: cat.name,
    count: categoryCountMap.get(cat._id.toString()) || 0,
  }));

  const recentSubmissions = recentBlogs.map(formatBlogPost);

  return {
    totalStories,
    publishedStories,
    pendingReviews: 0,
    activeAuthors,
    totalViews,
    draftsCount,
    categoryBreakdown,
    recentSubmissions,
    recentLogs: [],
    mostActiveEmployee,
  };
}

export const analyticsService = {
  getAnalytics,
};
