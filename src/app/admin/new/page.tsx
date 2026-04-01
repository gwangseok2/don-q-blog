"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Save,
  X,
  Eye,
  Edit3,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

const CATEGORIES = [
  { name: "시장·지표 분석", slug: "market-analysis" },
  { name: "종목 분석", slug: "stock-analysis" },
  { name: "내 매매일지", slug: "trading-log" },
  { name: "뉴스 & 이슈", slug: "news-issue" },
  { name: "맛집 후기", slug: "food-review" },
  { name: "일상", slug: "daily" },
  { name: "여행", slug: "travel" },
  { name: "투자 정보", slug: "stock-tip" },
  { name: "부동산 정보", slug: "home-tip" },
  { name: "꿀팁", slug: "common-tip" },
];

export default function AdminNewPost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "daily",
    slug: "",
    content: `안녕하세요, 돈큐입니다. 😊

## 1. 주제 선정 배경

---

## 2. 주요 내용

---

## 💡 마치며

---

## ✍️ 개인적인 코멘트
`,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Slug generation logic (improved)
  useEffect(() => {
    if (formData.title && !formData.slug) {
      // We don't auto-fill slug to avoid overriding user intent,
      // but we could provide a "Suggest" button.
    }
  }, [formData.title]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isCover: boolean = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !formData.slug) {
      if (!formData.slug) alert("슬러그를 먼저 입력해주세요!");
      return;
    }

    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("slug", formData.slug);
    body.append("isCover", isCover.toString());

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok) {
        if (isCover) {
          setCoverPreview(data.url);
        } else {
          // 본문 이미지일 경우 마크다운 삽입
          const imageTag = `\n![이미지 설명](${data.url})\n`;
          setFormData((prev) => ({
            ...prev,
            content: prev.content + imageTag,
          }));
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("업로드 실패");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "성공적으로 저장되었습니다!" });
      } else {
        setStatus({ type: "error", message: result.error });
      }
    } catch (err) {
      setStatus({ type: "error", message: "네트워크 오류" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 backdrop-blur-md bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            DonQ Blog Editor
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${status.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
            >
              {status.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {status.message}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {isSubmitting ? "저장 중..." : "게시하기"}
          </button>
        </div>
      </header>

      {/* Main Content Area: Side-by-Side */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Editor */}
        <section className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-sm">
            {/* Basic Info */}
            <div className="space-y-6">
              <input
                type="text"
                placeholder="제목을 입력하세요..."
                className="w-full bg-transparent text-4xl font-bold border-b border-white/10 py-2 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-white"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Excerpt (요약)
                </label>
                <input
                  type="text"
                  placeholder="리스트에서 보여질 짧은 설명을 입력하세요..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-700 text-white"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Category
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option
                        key={c.slug}
                        value={c.slug}
                        className="bg-slate-900"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                    Slug (English URL)
                  </label>
                  <input
                    type="text"
                    placeholder="my-awesome-post"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-700"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\-]/g, ""),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                <Camera size={14} /> Cover Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-48 w-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all overflow-hidden"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <ImageIcon size={32} />
                    <span className="text-sm font-medium">
                      커버 이미지를 업로드하세요 (JPG, PNG)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                  accept="image/*"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
                    업로드 중...
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                  <Edit3 size={14} /> Markdown Content
                </label>
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.onchange = (e: any) => handleImageUpload(e, false);
                    input.click();
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <ImageIcon size={12} /> 본문 이미지 삽입
                </button>
              </div>
              <textarea
                className="w-full h-[500px] bg-slate-900/50 border border-white/10 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[15px] leading-relaxed resize-none scrollbar-thin overflow-y-auto text-slate-300"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="본문을 작성하세요..."
              />
            </div>
          </div>
        </section>

        {/* Right: Live Preview */}
        <section className="hidden xl:flex flex-1 flex-col overflow-hidden bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-white/5">
            <Eye size={14} /> Live Preview
          </div>
          <div className="flex-1 overflow-y-auto p-12 bg-[#0f172a] prose prose-invert prose-blue max-w-none prose-headings:text-white prose-p:text-slate-400 prose-a:text-blue-400">
            {/* Preview Rendering Simulation */}
            <div className="space-y-8">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                />
              )}
              <h1 className="text-5xl font-black">
                {formData.title || "Untitled Post"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                  {formData.category}
                </span>
                <span>•</span>
                <span>{new Date().toLocaleDateString("ko-KR")}</span>
              </div>
              <p className="text-xl text-slate-300 italic border-l-4 border-blue-500 pl-6 py-2">
                {formData.excerpt || "요약 내용을 입력하면 이곳에 표시됩니다."}
              </p>
              <div className="whitespace-pre-wrap leading-loose text-slate-400 text-lg">
                {formData.content}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <footer className="mt-4 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] font-medium">
        Powered by Antigravity OS • Premium Writing Environment
      </footer>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
