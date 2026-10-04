export type UserRole = 'employee' | 'admin';

export interface Permission {
  name: string;
  resource: string;
  action: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: UserRole | string | any;
  roleName?: string;
  permissions?: Permission[];
  title?: string;
  department?: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  tokenVersion?: number;
  joinedDate?: string;
  publishedCount?: number;
  draftCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type PostStatus = 'draft' | 'in_review' | 'published' | 'rejected' | 'archived';

export interface Post {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorTitle?: string;
  authorAvatar?: string;
  status: PostStatus;
  viewCount: number;
  featured?: boolean;
  editorialNotes?: string;
  submittedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  color?: string;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModerationLog {
  id: string;
  postId: string;
  postTitle: string;
  reviewerId: string;
  reviewerName: string;
  action: 'approved' | 'rejected' | 'changes_requested' | 'archived' | 'restored';
  notes?: string;
  timestamp: string;
}

export interface PlatformAnalytics {
  totalStories: number;
  publishedStories: number;
  pendingReviews: number;
  activeAuthors: number;
  totalViews: number;
  draftsCount: number;
  categoryBreakdown: { name: string; count: number }[];
  recentSubmissions: Post[];
  recentLogs: ModerationLog[];
  mostActiveEmployee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    publishedCount: number;
    views: number;
  } | null;
}
