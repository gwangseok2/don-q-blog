"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import PostListContainer from "@/app/_components/post-list-container";

interface SimplePost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: any;
    coverImage: string;
}

export default function SearchResultsClient({ allPosts }: { allPosts: SimplePost[] }) {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const filteredPosts = useMemo(() => {
        if (!query) return [];
        return allPosts.filter((post) => {
            const searchStr = (post.title + post.excerpt).toLowerCase();
            return searchStr.includes(query.toLowerCase());
        });
    }, [allPosts, query]);

    return (
        <>
            <div className="mb-10 mt-8">
                <h1 className="text-3xl font-bold mb-4">
                    {query ? `"${query}" 검색 결과` : "검색 결과"}
                </h1>
                <p className="text-gray-500">
                    총 {filteredPosts.length}개의 글을 찾았습니다.
                </p>
            </div>
            {filteredPosts.length > 0 ? (
                <PostListContainer posts={filteredPosts as any} />
            ) : (
                <div className="py-20 text-center text-gray-500">
                    {query ? "검색 결과가 없습니다. 다른 검색어를 입력해 보세요." : "검색어를 입력해 보세요."}
                </div>
            )}
        </>
    );
}
