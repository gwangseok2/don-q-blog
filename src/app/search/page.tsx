import { getAllPosts } from "@/lib/api";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { Suspense } from "react";
import SearchResultsClient from "./search-results-client";

// 서버 컴포넌트: 빌드 타임(또는 서버 사이드)에서 데이터를 가져옴
export default function SearchPage() {
    // getAllPosts는 fs를 사용하므로 오직 서버 컴포넌트에서만 실행되어야 함
    const allPosts = getAllPosts().map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        author: post.author,
        coverImage: post.coverImage,
    }));

    return (
        <main>
            <Container>
                <Header />
                <Suspense fallback={<div className="py-20 text-center">검색 중...</div>}>
                    <SearchResultsClient allPosts={allPosts} />
                </Suspense>
            </Container>
        </main>
    );
}
