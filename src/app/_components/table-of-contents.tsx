"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TocItem = {
    id: string;
    text: string;
    level: number;
};

export default function TableOfContents({ htmlContent }: { htmlContent: string }) {
    const [toc, setToc] = useState<TocItem[]>([]);

    useEffect(() => {
        // 🚨 클라이언트 사이드에서 HTML 문자열에서 h2, h3 태그를 추출하여 목차 구성
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const headers = Array.from(doc.querySelectorAll("h2, h3"));

        const items: TocItem[] = headers.map((header) => ({
            id: header.id,
            text: header.textContent || "",
            level: parseInt(header.tagName.replace("H", ""), 10),
        }));

        setToc(items);
    }, [htmlContent]);

    if (toc.length === 0) return null;

    return (
        <nav className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span>📖</span> 목차
            </h2>
            <ul className="space-y-2">
                {toc.map((item) => (
                    <li
                        key={item.id}
                        style={{ marginLeft: `${(item.level - 2) * 1.5}rem` }}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <Link href={`#${item.id}`} className="block w-full">
                            {item.text}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
