import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { categoryService } from '@/services/categoryService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { LatestStories } from '@/components/home/LatestStories';
import { Compass } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryService.getCategoryBySlug(slug);
  if (!category) return { title: 'Topic Not Found — Blog Builder' };
  return {
    title: `${category.name} — Blog Builder Archive`,
    description: category.description,
  };
}

export const dynamic = 'force-dynamic';

export default async function TopicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const category = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await postService.getAllPosts({ categoryId: category.id, status: 'published' });
  const allCategories = await categoryService.getAllCategories();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={user} />
      <main className="flex-1">
        <section className="py-12 border-b border-[#EAE6DF] bg-[#F4EFE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#8C5D00] font-bold">
                <Compass className="w-3.5 h-3.5 text-[#FF8F00]" />
                <span>Archive Collection</span>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: category.color || '#FF8F00' }}
                />
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#343131]">
                  {category.name}
                </h1>
              </div>
              <p className="text-base text-[#6B6661] font-light leading-relaxed">
                {category.description}
              </p>
              <div className="pt-2 text-xs font-medium text-[#6B6661]">
                Total Essays: {posts.length}
              </div>
            </div>
          </div>
        </section>

        <LatestStories posts={posts} categories={allCategories} />
      </main>
      <Footer />
    </div>
  );
}
