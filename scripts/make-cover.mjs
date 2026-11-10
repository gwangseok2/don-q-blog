#!/usr/bin/env node
/**
 * 커버 이미지 생성기 (1200x630 PNG, 1MB 이하)
 *
 *   node scripts/make-cover.mjs --title "글 제목" --category stock-analysis --out public/assets/blog/slug/cover.png
 *
 * Playwright(Chromium)로 HTML 템플릿을 렌더링합니다.
 * 의존성: playwright (CI에서는 npm i --no-save playwright 로 설치)
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

const CATEGORY_THEME = {
  "market-analysis": { label: "시장·지표 분석", accent: "#38bdf8", bg: ["#0b1220", "#0f2a44"] },
  "stock-analysis": { label: "종목 분석", accent: "#34d399", bg: ["#0a1712", "#0f3b2c"] },
  "trading-log": { label: "매매일지", accent: "#a78bfa", bg: ["#120d1f", "#2a1d4a"] },
  "news-issue": { label: "뉴스 & 이슈", accent: "#f87171", bg: ["#1a0b0b", "#4a1717"] },
  "stock-tip": { label: "투자 정보", accent: "#fbbf24", bg: ["#17120a", "#3f2e0d"] },
  "home-tip": { label: "부동산 정보", accent: "#fb923c", bg: ["#170f0a", "#47260f"] },
  "common-tip": { label: "꿀팁", accent: "#facc15", bg: ["#13130a", "#36340e"] },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function splitTitle(title) {
  // "[종목분석] 제목" → 머리말 칩 + 본 제목
  const m = String(title).match(/^\s*\[([^\]]{1,20})\]\s*(.+)$/);
  return m ? { tag: m[1], main: m[2] } : { tag: null, main: title };
}

function html({ title, category }) {
  const theme = CATEGORY_THEME[category] || { label: "돈큐", accent: "#e5e7eb", bg: ["#0b0b0b", "#262626"] };
  const split = splitTitle(title);
  const main = split.main;
  const norm = (s) => String(s || "").replace(/[\s·&]/g, "");
  // 머리말이 카테고리명과 같으면("[종목분석]" vs "종목 분석") 칩 하나만 표시
  const tag = split.tag && norm(split.tag) !== norm(theme.label) ? split.tag : null;
  const len = [...main].length;
  const size = len <= 22 ? 76 : len <= 36 ? 64 : len <= 52 ? 54 : 46;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden;
    font-family: "Pretendard", "Noto Sans CJK KR", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
    background: radial-gradient(1200px 630px at 85% 10%, ${theme.bg[1]} 0%, ${theme.bg[0]} 60%); color: #f8fafc; }
  .wrap { position: relative; height: 100%; padding: 72px 84px; display: flex; flex-direction: column; }
  .grid { position: absolute; inset: 0; opacity: .08;
    background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px);
    background-size: 48px 48px; mask-image: linear-gradient(90deg, transparent 0%, #000 70%); }
  .chips { display: flex; gap: 14px; position: relative; }
  .chip { font-size: 26px; font-weight: 700; padding: 10px 22px; border-radius: 999px;
    color: ${theme.accent}; border: 2px solid ${theme.accent}; letter-spacing: -0.02em; }
  .chip.fill { background: ${theme.accent}; color: #0b0b0b; }
  h1 { position: relative; margin-top: auto; margin-bottom: auto; font-size: ${size}px; font-weight: 800;
    line-height: 1.28; letter-spacing: -0.035em; word-break: keep-all; max-width: 1000px; }
  .bar { width: 96px; height: 8px; background: ${theme.accent}; border-radius: 4px; margin-bottom: 28px; }
  .foot { position: relative; display: flex; justify-content: space-between; align-items: center;
    font-size: 26px; color: #cbd5e1; }
  .foot b { color: #fff; font-weight: 800; }
  </style></head><body><div class="wrap"><div class="grid"></div>
    <div class="chips">${tag ? `<span class="chip fill">${escapeHtml(tag)}</span>` : ""}<span class="chip">${escapeHtml(theme.label)}</span></div>
    <h1><div class="bar"></div>${escapeHtml(main)}</h1>
    <div class="foot"><span><b>돈큐</b>의 투자 인사이트</span><span>donqlog.com</span></div>
  </div></body></html>`;
}

export async function makeCover({ title, category, out }) {
  const { chromium } = require("playwright");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(html({ title, category }), { waitUntil: "load" });
    await page.screenshot({ path: out, type: "png" });
  } finally {
    await browser.close();
  }
  const size = fs.statSync(out).size;
  if (size > 1024 * 1024) throw new Error(`커버 이미지가 1MB를 넘습니다: ${size} bytes`);
  return out;
}

// CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const get = (k) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : undefined; };
  const title = get("title"), category = get("category"), out = get("out");
  if (!title || !out) {
    console.error('사용법: node scripts/make-cover.mjs --title "제목" --category stock-analysis --out path/cover.png');
    process.exit(1);
  }
  makeCover({ title, category, out }).then((p) => console.log(`✅ ${p}`));
}
