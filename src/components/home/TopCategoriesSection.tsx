import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Calendar, ArrowRight, FolderTree } from 'lucide-react';

interface TopCategoriesSectionProps {
  categories: (Category & { postCount: number })[];
  allPosts: Post[];
}

export const TopCategoriesSection: React.FC<TopCategoriesSectionProps> = ({
  categories,
  allPosts,
}) => {
  // Only consider categories that have published data / posts
  const categoriesWithData = categories
    .filter(cat => (cat.postCount || 0) > 0)
    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
    .slice(0, 3);

  if (categoriesWithData.length === 0) return null;

  return (
    <section className="py-16 bg-[#F4EFE6] border-y border-[#EAE6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#EAE6DF]">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF8F00] mb-2">
              <FolderTree className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Category Spotlight</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#343131]">
              Top Categories
            </h2>
            <p className="text-sm text-[#6B6661] mt-1 max-w-2xl">
              Our most active editorial channels and published perspectives in an in-line overview.
            </p>
          </div>

          <Link
            href="/topics"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#343131] hover:text-[#FF8F00] transition-colors self-start md:self-auto"
          >
            <span>Explore All Topics</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* In-Line 3-Column Grid for Top 3 Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {categoriesWithData.map((category, index) => {
            // Find the latest published posts for this category
            const categoryPosts = allPosts
              .filter(
                p =>
                  p.status === 'published' &&
                  (p.categoryId === category.id ||
                    p.categoryId === (category as any)._id ||
                    p.categoryName?.toLowerCase() === category.name.toLowerCase())
              )
              .slice(0, 2);

            const topStory = categoryPosts[0];

            return (
              <div
                key={category.id}
                className="group/card flex flex-col justify-between bg-white border border-[#EAE6DF] hover:border-[#FFB22C] rounded-3xl p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF]/70 mb-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: category.color || '#FF8F00' }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#96918B]">
                        Channel 0{index + 1}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#8C5D00] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full">
                      {category.postCount} {category.postCount === 1 ? 'Story' : 'Stories'}
                    </span>
                  </div>

                  {/* Category Name & Short Description */}
                  <Link href={`/topics/${category.slug}`} className="group/title block">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#343131] group-hover/title:text-[#FF8F00] transition-colors leading-tight">
                      {category.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#6B6661] mt-1.5 line-clamp-2 leading-relaxed mb-5">
                    {category.description}
                  </p>

                  {/* Latest Story Card inside this category */}
                  {topStory ? (
                    <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-4 space-y-3">
                      <Link
                        href={`/stories/${topStory.slug}`}
                        className="block relative aspect-16/10 rounded-xl overflow-hidden bg-[#EAE6DF]"
                      >
                        {topStory.coverImage ? (
                          <Image
                            src={topStory.coverImage}
                            alt={topStory.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#F2ECE1] p-3 text-center">
                            <span className="font-serif font-bold text-xs text-[#343131] line-clamp-2 px-2">
                              {topStory.title}
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2 text-[11px] text-[#96918B]">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {topStory.publishedAt
                              ? new Date(topStory.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : new Date(topStory.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                          </span>
                        </div>

                        <Link href={`/stories/${topStory.slug}`}>
                          <h4 className="font-serif text-sm sm:text-base font-bold text-[#343131] hover:text-[#FF8F00] transition-colors leading-snug line-clamp-2">
                            {topStory.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-[#6B6661] line-clamp-2 leading-relaxed">
                          {topStory.excerpt}
                        </p>
                      </div>

                      {/* Author */}
                      <div className="pt-2.5 border-t border-[#EAE6DF]/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Avatar src={topStory.authorAvatar} name={topStory.authorName} size="xs" />
                          <span className="text-xs font-medium text-[#343131] truncate">
                            {topStory.authorName}
                          </span>
                        </div>

                        <Link
                          href={`/stories/${topStory.slug}`}
                          className="inline-flex items-center text-xs font-bold text-[#FF8F00] hover:underline shrink-0"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EAE6DF] p-4">
                      <p className="text-xs text-[#6B6661]">No stories in this channel yet.</p>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="mt-5 pt-4 border-t border-[#EAE6DF]/70">
                  <Link
                    href={`/topics/${category.slug}`}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FAF8F5] border border-[#EAE6DF] hover:bg-[#FFB22C] hover:text-[#343131] hover:border-[#FFB22C] text-[#343131] transition-all shadow-2xs"
                  >
                    <span>View all in {category.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
