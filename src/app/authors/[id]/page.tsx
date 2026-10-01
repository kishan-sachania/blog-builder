import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authorService } from '@/services/authorService';
import { postService } from '@/services/postService';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Avatar } from '@/components/common/Avatar';
import { Clock, Calendar, ArrowRight, BookOpen, Eye, Edit3 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AuthorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const author = await authorService.getAuthorById(id);

  if (!author) {
    notFound();
  }

  const posts = await postService.getAllPosts({ authorId: id, status: 'published' });
  const totalReads = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const isOwnProfile = currentUser?.id === author.id;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar initialUser={currentUser} />
      <main className="flex-1 py-12">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#EAE6DF] shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <Avatar src={author.avatarUrl} name={author.name} size="xl" className="w-24 h-24 text-2xl" />

              <div className="space-y-4 flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00]">
                        {author.role === 'admin' ? 'Editorial Board & Admin' : 'Contributing Author'}
                      </span>
                    </div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#343131] mt-1.5">
                      {author.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#6B6661]">
                      {author.title} • {author.department}
                    </p>
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/studio/profile"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#343131] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit My Profile</span>
                    </Link>
                  )}
                </div>

                <p className="text-sm text-[#44403c] leading-relaxed max-w-2xl">
                  {author.bio || 'Staff author at The Common Thread, publishing technical findings and organizational reflections.'}
                </p>

                <div className="pt-4 border-t border-[#EAE6DF] flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-[#6B6661]">
                  <div>
                    <span className="font-bold text-[#343131] text-base">{posts.length}</span>{' '}
                    <span>Published {posts.length === 1 ? 'Essay' : 'Essays'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#343131] text-base">{totalReads}</span>{' '}
                    <span>Total Reads</span>
                  </div>
                  <div>
                    <span>Contributing since {author.joinedDate || '2024'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="border-b border-[#EAE6DF] pb-4 mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#343131] flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#FF8F00]" />
              <span>Published by {author.name}</span>
            </h2>
            <span className="text-xs text-[#6B6661]">
              {posts.length} {posts.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#EAE6DF]">
              <p className="text-sm text-[#6B6661]">No published stories yet by this author.</p>
              {isOwnProfile && (
                <Link
                  href="/studio/new"
                  className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-colors"
                >
                  <span>Write your first story</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#EAE6DF] bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-2xs">
              {posts.map(post => (
                <article key={post.id} className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-[#6B6661]">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C5D00] font-semibold text-[10px]">
                        {post.categoryName}
                      </span>
                    </div>

                    <Link href={`/stories/${post.slug}`} className="group block">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#343131] group-hover:text-[#FF8F00] transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-[#6B6661] line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="md:col-span-4">
                    <Link href={`/stories/${post.slug}`} className="block relative aspect-16/10 rounded-xl overflow-hidden bg-[#EAE6DF]">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-104 transition-transform duration-300"
                        unoptimized
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
