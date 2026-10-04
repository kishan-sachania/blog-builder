import React from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/categoryService';
import { blogService } from '@/services/blogService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ArrowRight, Compass } from 'lucide-react';

export const metadata = {
  title: 'Topics & Editorial Archives - Blog Builder',
  description: 'Explore publication archives by discipline, craft, engineering systems, and workplace culture.',
};

export const dynamic = 'force-dynamic';

export default async function TopicsIndexPage() {
  const user = await getCurrentUser();
  const categories = await categoryService.getAllCategories();
  const allPosts = await blogService.getAllPosts({ status: 'published' });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={user} />
      <main className="flex-1 py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-3">
            <Compass className="w-4 h-4" />
            <span>Thematic Directory</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#343131]">
            Topics & Editorial Archives
          </h1>
          <p className="text-base sm:text-lg text-[#6B6661] mt-3 font-light leading-relaxed">
            Browse our collected repository of architectural deep-dives, design explorations, and cultural principles.
          </p>
        </div>

        {/* Categories Grid with preview stories */}
        <div className="space-y-12">
          {categories.map(category => {
            const categoryPosts = allPosts.filter(p => p.categoryId === category.id).slice(0, 3);

            return (
              <div
                key={category.id}
                className="p-8 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6DF]">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: category.color || '#FF8F00' }}
                      />
                      <h2 className="font-serif text-2xl font-bold text-[#343131]">
                        {category.name}
                      </h2>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00]">
                        {category.postCount} {category.postCount === 1 ? 'essay' : 'essays'}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B6661] mt-2 max-w-2xl">
                      {category.description}
                    </p>
                  </div>

                  <Link
                    href={`/topics/${category.slug}`}
                    className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#343131] hover:text-[#FF8F00] transition-colors shrink-0"
                  >
                    <span>View all {category.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-6">
                  {categoryPosts.length === 0 ? (
                    <p className="text-xs text-[#96918B] italic py-2">
                      No published articles in this archive yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {categoryPosts.map(post => (
                        <Link
                          key={post.id}
                          href={`/stories/${post.slug}`}
                          className="group p-4 rounded-xl hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-[#EAE6DF] flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[11px] text-[#6B6661] block mb-1">
                              By {post.authorName}
                            </span>
                            <h3 className="font-serif text-base font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-snug line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-[#6B6661] mt-1.5 line-clamp-2 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>
                          <span className="mt-3 text-[11px] font-semibold text-[#FF8F00] flex items-center">
                            Read Essay <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
