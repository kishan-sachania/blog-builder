import React from 'react';
import { postService } from '@/services/postService';
import { categoryService } from '@/services/categoryService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedStory } from '@/components/home/FeaturedStory';
import { LatestStories } from '@/components/home/LatestStories';
import { TopicsSection } from '@/components/home/TopicsSection';
import { MissionSection } from '@/components/home/MissionSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  const allPosts = await postService.getAllPosts({ status: 'published' });
  const categories = await categoryService.getAllCategories();

  const featuredPost = allPosts.find(p => p.featured) || allPosts[0];
  const remainingPosts = featuredPost
    ? allPosts.filter(p => p.id !== featuredPost.id)
    : allPosts;

  return (
    <div className="h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={user} />
      <main className="flex-1">
        <HeroSection />
        {/* {featuredPost && <FeaturedStory post={featuredPost} />} */}
        {/* <LatestStories posts={remainingPosts} categories={categories} /> */}
        {/* <TopicsSection categories={categories} /> */}
        {/* <MissionSection /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
