import { PostPreview } from "./post-preview";
import { Post } from "@/interfaces/post";

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
            <div className="flex flex-col gap-0 mb-32 max-w-4xl">
                {posts.map((post) => (
                    <PostPreview
                        key={post.slug}
                        title={post.title}
                        coverImage={post.coverImage}
                        date={post.date}
                        author={post.author}
                        slug={post.slug}
                        excerpt={post.excerpt}
                        viewMode="list"
                    />
                ))}
            </div>
        </section>
    );
}
