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

  // Simple markdown-to-editorial parser fallback
  const renderFormattedBody = (rawContent: string) => {
    const paragraphs = rawContent.split('\n\n');

    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H2 Heading: ## ...
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917] mt-10 mb-4 leading-snug">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // H3 Heading: ### ...
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-serif text-xl sm:text-2xl font-bold text-[#1c1917] mt-8 mb-3 leading-snug">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Blockquote: > ...
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace(/^>\s*/, '').replace(/^"|"$/g, '');
        return (
          <blockquote
            key={idx}
            className="my-8 pl-6 border-l-4 border-[#FF8F00] font-serif italic text-xl sm:text-2xl text-[#44403c] leading-relaxed bg-[#FAF3E0]/30 py-4 pr-4 rounded-r-xl"
          >
            &ldquo;{quoteText}&rdquo;
          </blockquote>
        );
      }

      // Code block: ``` ... ```
      if (trimmed.startsWith('```')) {
        const lines = trimmed.split('\n');
        const code = lines.slice(1, -1).join('\n') || lines.slice(1).join('\n').replace(/```$/, '');
        return (
          <pre
            key={idx}
            className="my-6 p-4 rounded-xl bg-[#292524] text-[#F5F5F4] overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed"
          >
            <code>{code}</code>
          </pre>
        );
      }

      // Ordered or unordered list: 1. or - or *
      if (/^(\d+\.|\*|-)\s/.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="my-6 space-y-2 list-disc list-outside pl-6 text-[#343131] leading-relaxed">
            {items.map((item, itemIdx) => {
              const cleanItem = item.replace(/^(\d+\.|\*|-)\s+/, '');
              return (
                <li key={itemIdx} className="pl-1">
                  {renderInlineFormatting(cleanItem)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-base sm:text-lg text-[#343131] leading-relaxed mb-6">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  // Helper for inline bold, italic, and inline code
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#1c1917]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="font-serif italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-[#EFEAE1] text-[#343131] px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

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
          renderFormattedBody(content)
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
