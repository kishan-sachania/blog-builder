import mongoose from 'mongoose';
import { User, Blog } from '@/models';
import { connectDB } from '@/lib/db';
import { User as UserType } from '@/types';
import { getRole } from './roleService';
import { getRoleName, isAdminRole } from '@/lib/auth';

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface AuthorWithStats extends UserType {
  publishedStoriesCount: number;
  totalReads: number;
}

export async function getUsers(options: GetUsersOptions = {}) {
  await connectDB();
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

  const query: any = {};

  if (options.search?.trim()) {
    const searchRegex = { $regex: options.search.trim(), $options: 'i' };
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      query.createdAt.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const sortField = options.sortBy === 'name' ? 'name' : 'createdAt';
  const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
  const sortOption: any = { [sortField]: sortDirection };

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('role', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u: any) => u._id);
  const blogStats = await Blog.aggregate([
    { $match: { author: { $in: userIds } } },
    {
      $group: {
        _id: { author: '$author', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map<string, { publishedCount: number; draftCount: number }>();
  for (const s of blogStats) {
    if (s._id?.author) {
      const authorId = s._id.author.toString();
      const current = statsMap.get(authorId) || { publishedCount: 0, draftCount: 0 };
      if (s._id.status === 'published') {
        current.publishedCount += s.count;
      } else if (s._id.status === 'draft') {
        current.draftCount += s.count;
      }
      statsMap.set(authorId, current);
    }
  }

  return {
    items: users.map((u: any) => {
      const userId = u._id.toString();
      const stats = statsMap.get(userId) || { publishedCount: 0, draftCount: 0 };
      return {
        ...u,
        id: userId,
        roleName: getRoleName(u),
        publishedCount: stats.publishedCount,
        draftCount: stats.draftCount,
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getUserById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const user = await User.findById(id).populate('role', 'name permissions').lean();
  if (!user) return null;
  return {
    ...user,
    id: (user as any)._id.toString(),
    roleName: getRoleName(user),
  };
}

export async function getUserByEmail(email: string) {
  if (!email) return null;
  await connectDB();
  return User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('role', 'name permissions');
}

export async function createUser(payload: any) {
  await connectDB();
  const { name, email, password, role } = payload;
  const roleDoc = await getRole(role || 'employee');
  if (!roleDoc) {
    throw new Error(`Role '${role}' not found`);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('User already exists');
  }

  return User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: roleDoc._id,
    password,
  });
}

export async function updateUser(id: string, updates: any) {
  await connectDB();
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.avatar || updates.avatarUrl) updateData.avatar = updates.avatar || updates.avatarUrl;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.department !== undefined) updateData.department = updates.department;

  if (updates.role) {
    const roleDoc = await getRole(updates.role);
    if (!roleDoc) {
      throw new Error(`Role '${updates.role}' not found`);
    }
    updateData.role = roleDoc._id;
  }

  const user = await User.findByIdAndUpdate(id, updateData, { new: true })
    .populate('role', 'name')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }

  return {
    ...user,
    id: (user as any)._id.toString(),
    roleName: getRoleName(user),
  };
}

export async function deleteUser(id: string) {
  await connectDB();
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function getAllAuthors(): Promise<AuthorWithStats[]> {
  await connectDB();
  const [users, blogStats] = await Promise.all([
    User.find().populate('role', 'name').lean(),
    Blog.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          publishedCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
        },
      },
    ]),
  ]);

  const statsMap = new Map<string, { count: number; views: number }>();
  for (const s of blogStats) {
    if (s._id) {
      statsMap.set(s._id.toString(), {
        count: s.publishedCount || 0,
        views: s.totalViews || 0,
      });
    }
  }

  return users.map((u: any) => {
    const userId = u._id.toString();
    const stats = statsMap.get(userId) || { count: 0, views: 0 };
    const isAdmin = isAdminRole(u);

    return {
      id: userId,
      name: u.name || 'Author',
      email: u.email || '',
      passwordHash: '',
      role: (isAdmin ? 'admin' : 'employee') as any,
      roleName: isAdmin ? 'admin' : 'employee',
      title: u.title || (isAdmin ? 'Editor-in-Chief' : 'Staff Contributor'),
      department: u.department || (isAdmin ? 'Editorial Board' : 'Editorial'),
      avatarUrl: u.avatar || '',
      bio: u.bio || '',
      joinedDate: u.createdAt ? new Date(u.createdAt).getFullYear().toString() : '2024',
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
      publishedStoriesCount: stats.count,
      totalReads: stats.views,
    };
  });
}

export async function getAuthorById(id: string): Promise<UserType | null> {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const u = await User.findById(id).populate('role', 'name').lean();
  if (!u) return null;

  const isAdmin = isAdminRole(u);

  return {
    id: (u as any)._id.toString(),
    name: (u as any).name || 'Author',
    email: (u as any).email || '',
    passwordHash: '',
    role: (isAdmin ? 'admin' : 'employee') as any,
    roleName: isAdmin ? 'admin' : 'employee',
    title: (u as any).title || (isAdmin ? 'Editor-in-Chief' : 'Staff Contributor'),
    department: (u as any).department || (isAdmin ? 'Editorial Board' : 'Editorial'),
    avatarUrl: (u as any).avatar || '',
    bio: (u as any).bio || '',
    joinedDate: (u as any).createdAt ? new Date((u as any).createdAt).getFullYear().toString() : '2024',
    createdAt: (u as any).createdAt ? new Date((u as any).createdAt).toISOString() : '',
  };
}

export const userService = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllAuthors,
  getAuthorById,
};
