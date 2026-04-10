"use client";

import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
  viewMode?: "card" | "list";
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  viewMode = "card",
}: Props) {
  const [likes, setLikes] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ count: likesCount }, { count: commentsCnt }] = await Promise.all([
          supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_slug", slug),
          supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_slug", slug)
        ]);

        if (likesCount !== null) setLikes(likesCount);
        if (commentsCnt !== null) setCommentsCount(commentsCnt);

        // 로컬 스토리지에서 공감 여부 확인
        const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
        if (likedPosts.includes(slug)) {
          setHasLiked(true);
        }
      } catch (e) {
        console.error("Failed to fetch interaction data", e);
      }
    };
    fetchData();
  }, [slug]);

  if (viewMode === "card") {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="aspect-[16/9] w-full">
          <CoverImage slug={slug} title={title} src={coverImage} />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="text-xs text-gray-500 mb-2">
            <DateFormatter dateString={date} />
          </div>
          <h3 className="text-lg font-bold mb-3 leading-tight line-clamp-2">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 overflow-hidden flex-1">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 mb-4 text-[12px] text-gray-400 font-medium">
            <span>공감 {likes}</span>
            <span>댓글 {commentsCount}</span>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-50">
            <Avatar name={author.name} picture={author.picture} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-3 py-6 md:py-8 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <img src={author.picture} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-100" alt={author.name} />
          <div className="flex flex-col">
            <span className="text-[13px] md:text-[14px] font-medium text-gray-800 leading-none">{author.name}</span>
            <span className="text-[11px] md:text-[12px] text-gray-400 mt-0.5">
              <DateFormatter dateString={date} />
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-[18px] md:text-[22px] font-bold leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">
        <Link href={`/posts/${slug}`}>
          {title}
        </Link>
      </h3>

      <div className="flex gap-4 md:gap-8 items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] md:text-[16px] text-gray-500 line-clamp-3 leading-snug md:leading-relaxed">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 mt-4 text-[12px] md:text-[13px] font-medium">
            <span className={hasLiked ? "text-red-500" : "text-gray-400"}>공감 {likes}</span>
            <span className="text-gray-400">댓글 {commentsCount}</span>
          </div>
        </div>
        <div className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] flex-shrink-0 rounded-md overflow-hidden border border-gray-50 shadow-sm flex items-center justify-center">
          <Link href={`/posts/${slug}`} className="w-full h-full block">
            <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          </Link>
        </div>
      </div>
    </div>
  );
}
