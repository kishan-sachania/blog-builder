import { User as UserType } from '@/types';
import { User } from '../../models/user';
import { Blog } from '../../models/blog/blog';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export interface AuthorWithStats extends UserType {
  publishedStoriesCount: number;
  totalReads: number;
}

export const authorService = {
  async getAllAuthors(): Promise<AuthorWithStats[]> {
    await connectDB();
    const users = await User.find().lean();

    const authorsWithStats = await Promise.all(
      users.map(async (u: any) => {
        const count = await Blog.countDocuments({
          author: u._id,
          status: 'published',
        });

        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          passwordHash: '',
          role: 'employee' as const,
          title: u.title || 'Author',
          department: u.department || 'Editorial',
          avatarUrl: u.avatar || '',
          bio: u.bio || '',
          joinedDate: u.createdAt ? new Date(u.createdAt).toISOString() : '',
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
          publishedStoriesCount: count,
          totalReads: 0,
        };
      })
    );

    return authorsWithStats;
  },

  async getAuthorById(id: string): Promise<UserType | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const u = await User.findById(id).lean();
    if (!u) return null;

    return {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      passwordHash: '',
      role: 'employee',
      title: u.title || 'Author',
      department: u.department || 'Editorial',
      avatarUrl: u.avatar || '',
      bio: u.bio || '',
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString() : '',
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
    };
  },
};
