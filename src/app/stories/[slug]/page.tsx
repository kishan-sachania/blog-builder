import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { postService } from '@/services/postService';
import { incrementBlogViews } from '@/services/blogServices';
import { authorService } from '@/services/authorService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleContent } from '@/components/article/ArticleContent';
import { AuthorBioCard } from '@/components/article/AuthorBioCard';
import { RelatedStories } from '@/components/article/RelatedStories';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug) || await postService.getPostById(slug);
  if (!post) {
    return { title: 'Story Not Found — Blog Builder' };
  }
  return {
    title: `${post.title} — Blog Builder`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function StoryReadingPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const post = await postService.getPostBySlug(slug) || await postService.getPostById(slug);

  if (!post) {
    notFound();
  }

  // Increment views in background
  if (post.id) {
    incrementBlogViews(post.id).catch(() => {});
  }

  const author = (await authorService.getAuthorById(post.authorId)) || {
    id: post.authorId,
    name: post.authorName,
    email: '',
    passwordHash: '',
    role: 'employee',
    title: post.authorTitle,
    department: 'Contributor',
    avatarUrl: post.authorAvatar,
    bio: '',
    joinedDate: '',
    createdAt: ''
  };

  const relatedPosts = await postService.getAllPosts({
    categoryId: post.categoryId,
    status: 'published'
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={user} />
      <main className="flex-1 pb-16">
        <ArticleHeader post={post} />
        <ArticleContent
          content={post.content}
          coverImage={post.coverImage}
          title={post.title}
          tags={post.tags}
        />
        <AuthorBioCard author={author} />
        <RelatedStories
          currentPostId={post.id}
          posts={relatedPosts}
          categoryName={post.categoryName}
        />
      </main>
      <Footer />
    </div>
  );
}
