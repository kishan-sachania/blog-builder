import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/util';

interface FeaturedStoryProps {
  post: Post;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({ post }) => {
  const formattedDate = formatDate(post.publishedAt || post.createdAt);

  return (
    <section className="py-12 border-b border-[#EAE6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#FF8F00] font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#FF8F00]" />
          <span>Editor&apos;s Feature Story</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Cover image container */}
          <div className="lg:col-span-7">
            <Link href={`/stories/${post.slug}`} className="group block overflow-hidden rounded-2xl bg-[#EAE6DF] border border-[#EAE6DF] shadow-sm">
              <div className="relative aspect-16/10 w-full overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#F2ECE1] p-8 text-center space-y-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#8C5D00] bg-[#FFB22C]/30 px-3 py-1 rounded-full">
                      {post.categoryName}
                    </span>
                    <span className="font-serif font-bold text-2xl text-[#343131] max-w-md line-clamp-2">
                      {post.title}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Editorial Content */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB22C]/20 text-[#8C5D00]">
                {post.categoryName}
              </span>
            </div>

            <Link href={`/stories/${post.slug}`} className="group">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-[1.2]">
                {post.title}
              </h2>
            </Link>

            <p className="text-sm sm:text-base text-[#6B6661] line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-[#EAE6DF]/70">
              <Link
                href={`/authors/${post.authorId}`}
                className="group/author flex items-center space-x-3"
              >
                <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
                <div>
                  <h4 className="text-xs font-semibold text-[#343131] group-hover/author:text-[#FF8F00] transition-colors">
                    {post.authorName}
                  </h4>
                  <p className="text-[11px] text-[#6B6661]">{post.authorTitle}</p>
                </div>
              </Link>

              <div className="text-[11px] text-[#6B6661] flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-[#96918B]" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div>
              <Link
                href={`/stories/${post.slug}`}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#343131] hover:text-[#FF8F00] transition-colors group"
              >
                <span>Read Full Essay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
