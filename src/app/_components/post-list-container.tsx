"use client";

import { useState } from "react";
import { MoreStories } from "./more-stories";
import ViewToggle from "./view-toggle";
import { Post } from "@/interfaces/post";

export default function PostListContainer({ posts }: { posts: Post[] }) {
    const [viewMode, setViewMode] = useState<"card" | "list">("list");

    return (
        <div>
            <div className="flex justify-end mb-6">
                <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
            <MoreStories posts={posts} viewMode={viewMode} />
        </div>
    );
}
