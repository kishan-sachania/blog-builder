export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  roleName?: string;
  permissions?: { resource: string; action: string; name?: string }[];
  title: string;
  department: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'in_review' | 'published' | 'rejected' | 'archived';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
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
  slug: string;
  name: string;
  description: string;
  color: string;
  postCount?: number;
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
