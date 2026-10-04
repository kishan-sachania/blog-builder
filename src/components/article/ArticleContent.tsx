import React from 'react';
import Image from 'next/image';
import { Tag } from 'lucide-react';

interface ArticleContentProps {
  content: string;
  coverImage: string;
  title: string;
  tags: string[];
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  coverImage,
  title,
  tags
}) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Featured Cover Image */}
      {coverImage && (
        <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-[#EAE6DF] border border-[#EAE6DF] shadow-sm mb-12">
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      {/* Editorial Body Content */}
      <div className="max-w-3xl mx-auto font-sans leading-relaxed selection:bg-[#FFB22C]/40">
        {isHtml ? (
          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose-editorial whitespace-pre-line space-y-4 text-base sm:text-lg text-[#343131]">
            {content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Tags section */}
      {tags && tags.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-[#EAE6DF] flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#6B6661] mr-2 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1" />
            Filed under:
          </span>
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center text-xs font-medium text-[#44403c] bg-white border border-[#EAE6DF] px-3 py-1 rounded-full hover:border-[#FFB22C] transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
