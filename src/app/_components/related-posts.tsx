import { Post } from "@/interfaces/post";
import Link from "next/link";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

type Props = {
    posts: Post[];
};

export default function RelatedPosts({ posts }: Props) {
    if (posts.length === 0) return null;

    return (
        <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-16">
            <h2 className="mb-8 text-3xl font-bold tracking-tighter leading-tight">
                💡 함께 읽으면 좋은 글
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 md:gap-y-32 mb-32">
                {posts.map((post) => (
                    <div key={post.slug}>
                        <div className="mb-5">
                            <CoverImage slug={post.slug} title={post.title} src={post.coverImage} />
                        </div>
                        <h3 className="text-2xl mb-3 leading-snug font-semibold text-slate-800 dark:text-slate-200">
                            <Link href={`/posts/${post.slug}`} className="hover:underline">
                                {post.title}
                            </Link>
                        </h3>
                        <div className="text-lg mb-4 text-slate-500">
                            <DateFormatter dateString={post.date} />
                        </div>
                        <p className="text-lg leading-relaxed mb-4 text-slate-600 dark:text-slate-400">
                            {post.excerpt}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
