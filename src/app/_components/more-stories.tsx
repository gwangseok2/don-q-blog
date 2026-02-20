import { Post } from "@/interfaces/post";
import { PostPreview } from "./post-preview";

type Props = {
  posts: Post[];
  viewMode?: "card" | "list";
};

export function MoreStories({ posts, viewMode = "list" }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
          More Stories
        </h2>
      </div>
      <div className={`grid gap-y-12 mb-32 ${viewMode === "card"
          ? "grid-cols-1 md:grid-cols-2 gap-x-8"
          : "grid-cols-1"
        }`}>
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
            viewMode={viewMode}
          />
        ))}
      </div>
    </section>
  );
}
