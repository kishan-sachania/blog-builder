import React from 'react';
import { blogService } from '@/services/blogService';
import { categoryService } from '@/services/categoryService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedStory } from '@/components/home/FeaturedStory';
import { RecentStoriesGrid } from '@/components/home/RecentStoriesGrid';
import { TopCategoriesSection } from '@/components/home/TopCategoriesSection';
import { MissionSection } from '@/components/home/MissionSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  const allPosts = await blogService.getAllPosts({ status: 'published' });
  const categories = await categoryService.getAllCategories();

  const featuredPost = allPosts.find(p => p.featured) || (allPosts.length > 0 ? allPosts[0] : undefined);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={user} />
      <main className="flex-1">
        <HeroSection />

        {featuredPost && <FeaturedStory post={featuredPost} />}

        <RecentStoriesGrid posts={allPosts} categories={categories} />

        <TopCategoriesSection categories={categories} allPosts={allPosts} />

        <MissionSection />
      </main>
      <Footer />
    </div>
  );
}
