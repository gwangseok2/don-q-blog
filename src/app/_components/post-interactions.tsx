"use client";

import { useState, useEffect } from "react";
import { Heart, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Comment {
    id: number;
    author_name: string;
    content: string;
    created_at: string;
}

export default function PostInteractions({ slug }: { slug: string }) {
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [authorName, setAuthorName] = useState("");
    const [newComment, setNewComment] = useState("");
    const [isLiking, setIsLiking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        fetchLikes();
        fetchComments();

        // 로컬 스토리지에서 공감 여부 확인
        const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
        if (likedPosts.includes(slug)) {
            setHasLiked(true);
        }
    }, [slug]);

    const fetchLikes = async () => {
        try {
            const { count, error } = await supabase
                .from("post_likes")
                .select("*", { count: "exact", head: true })
                .eq("post_slug", slug);

            if (error) throw error;
            if (count !== null) setLikes(count);
        } catch (e) {
            console.error("Failed to fetch likes", e);
        }
    };

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from("post_comments")
                .select("*")
                .eq("post_slug", slug)
                .order("created_at", { ascending: true });

            if (error) throw error;
            if (data) setComments(data);
        } catch (e) {
            console.error("Failed to fetch comments", e);
        }
    };

    const handleLike = async () => {
        if (isLiking || hasLiked) return;
        setIsLiking(true);
        try {
            const { error } = await supabase
                .from("post_likes")
                .insert({ post_slug: slug });

            if (error && error.code !== "23505") throw error;

            // 로컬 스토리지에 저장
            const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
            if (!likedPosts.includes(slug)) {
                likedPosts.push(slug);
                localStorage.setItem("liked_posts", JSON.stringify(likedPosts));
            }
            setHasLiked(true);
            fetchLikes();
        } catch (e) {
            console.error("Failed to like", e);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorName.trim() || !newComment.trim() || isSubmitting) return;

        // 댓글 테러 방지: 30초 쿨타임
        const lastComment = localStorage.getItem("last_comment_time");
        const now = Date.now();
        if (lastComment && now - parseInt(lastComment) < 30000) {
            alert("댓글은 30초마다 작성할 수 있습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("post_comments")
                .insert({ post_slug: slug, author_name: authorName.trim(), content: newComment.trim() });

            if (error) throw error;

            localStorage.setItem("last_comment_time", now.toString());
            setNewComment("");
            fetchComments();
        } catch (e) {
            console.error("Failed to submit comment", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={handleLike}
                    disabled={isLiking || hasLiked}
                    className={`flex items-center gap-2 group transition-all ${hasLiked ? "cursor-default" : "cursor-pointer"}`}
                >
                    <div className={`p-2 rounded-full transition-colors ${isLiking ? "bg-red-50 scale-90" : hasLiked ? "bg-red-50" : "group-hover:bg-red-50 group-active:scale-95"}`}>
                        <Heart size={24} className={hasLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                    </div>
                    <span className={`font-semibold ${hasLiked ? "text-red-500" : "text-gray-500"}`}>공감 {likes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="p-2">
                        <MessageSquare size={24} />
                    </div>
                    <span className="font-semibold">댓글 {comments.length}</span>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 md:p-10 border border-gray-100">
                <h3 className="text-xl font-bold mb-8 text-gray-800">댓글 <span className="text-blue-600 ml-1">{comments.length}</span></h3>

                {/* Comment List */}
                <div className="space-y-6 mb-10">
                    {comments.length === 0 ? (
                        <div className="text-gray-400 text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                            첫 댓글을 남겨보세요! 😊
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-[15px] text-gray-800">{comment.author_name}</span>
                                    <span className="text-[12px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="작성자 이름"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-[14px] bg-white transition-all shadow-sm"
                            required
                        />
                        <div className="relative shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <textarea
                                placeholder="따뜻한 댓글을 남겨주세요..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full p-4 focus:outline-none text-[15px] min-h-[120px] bg-white resize-none"
                                required
                            />
                            <div className="absolute right-3 bottom-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 shadow-sm"
                                >
                                    <span className="text-sm font-bold">등록</span>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
