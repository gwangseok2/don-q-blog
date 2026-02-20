import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

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
  viewMode = "list",
}: Props) {
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
          <h3 className="text-xl font-bold mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {excerpt}
          </p>
          <div className="mt-auto pt-4 border-t border-gray-50">
            <Avatar name={author.name} picture={author.picture} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-full md:w-1/3 flex-shrink-0">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl md:text-3xl mb-3 leading-snug font-bold">
          <Link href={`/posts/${slug}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        <div className="text-sm text-gray-500 mb-3">
          <DateFormatter dateString={date} />
        </div>
        <p className="text-base md:text-lg leading-relaxed mb-4 line-clamp-2 md:line-clamp-3">
          {excerpt}
        </p>
        <Avatar name={author.name} picture={author.picture} />
      </div>
    </div>
  );
}
