"use client";

import { LayoutGrid, List } from "lucide-react";

type ViewMode = "card" | "list";

interface Props {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: Props) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
                onClick={() => onChange("list")}
                className={`p-2 rounded-md transition-all ${mode === "list"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                title="리스트형으로 보기"
            >
                <List size={20} />
            </button>
            <button
                onClick={() => onChange("card")}
                className={`p-2 rounded-md transition-all ${mode === "card"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                title="카드형으로 보기"
            >
                <LayoutGrid size={20} />
            </button>
        </div>
    );
}
