import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { Clock, ArrowRight } from 'lucide-react';

interface RelatedStoriesProps {
  currentPostId: string;
  posts: Post[];
  categoryName: string;
}

export const RelatedStories: React.FC<RelatedStoriesProps> = ({
  currentPostId,
  posts,
  categoryName
}) => {
  const related = posts
    .filter(p => p.id !== currentPostId && p.status === 'published')
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="py-14 border-t border-[#EAE6DF] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF8F00]">
              Continue Reading
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#343131]">
              More from {categoryName}
            </h3>
          </div>

          <Link
            href="/topics"
            className="inline-flex items-center text-xs font-semibold text-[#343131] hover:text-[#FF8F00] transition-colors"
          >
            <span>Browse Topics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map(story => (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              className="group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-[#EAE6DF] mb-4">
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                    unoptimized
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#6B6661] mb-2">
                  <span className="font-medium text-[#343131]">{story.authorName}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {story.readingTimeMinutes} min read
                  </span>
                </div>

                <h4 className="font-serif text-lg font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-snug line-clamp-2">
                  {story.title}
                </h4>

                <p className="text-xs text-[#6B6661] mt-2 line-clamp-2 leading-relaxed">
                  {story.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE6DF] text-xs font-semibold text-[#FF8F00] flex items-center">
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
