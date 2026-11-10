#!/usr/bin/env node
/**
 * AI 초안 생성기
 *
 * Claude API(웹 검색 포함)로 rule.md 규칙을 따르는 글 초안을 만들어
 * _posts/[slug].md 와 public/assets/blog/[slug]/cover.png 를 생성합니다.
 *
 * 주제 결정 순서
 *   1) --topic "주제"
 *   2) automation/topics.md 의 첫 번째 미완료 항목 (- [ ] ...)
 *   3) 둘 다 없으면 Claude가 최근 이슈를 조사해 직접 선정
 *
 * 사용법
 *   ANTHROPIC_API_KEY=... node scripts/draft-post.mjs [--topic "..."] [--category stock-analysis] [--date 2026-11-12]
 *   node scripts/draft-post.mjs --from-response sample.txt   # API 호출 없이 후처리만 테스트
 *
 * 환경 변수
 *   ANTHROPIC_API_KEY  필수
 *   DRAFT_MODEL        기본 claude-opus-5-5
 *   DRAFT_META_OUT     PR 본문용 메타데이터(JSON) 저장 경로
 */
import fs from "fs";
import path from "path";
import https from "https";
import os from "os";
import { makeCover } from "./make-cover.mjs";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "_posts");
const ASSETS_DIR = path.join(ROOT, "public/assets/blog");
const TOPICS_FILE = path.join(ROOT, "automation/topics.md");
const RULE_FILE = path.join(ROOT, "rule.md");

const MODEL = process.env.DRAFT_MODEL || "claude-opus-5-5";
const API_VERSION = process.env.ANTHROPIC_VERSION || "2023-06-01";

// AI가 직접 경험 없이 쓸 수 있는 카테고리만 허용 (맛집·일상·여행·매매일지는 사람이 작성)
const AUTO_CATEGORIES = {
  "market-analysis": "해외주식 > 시장·지표 분석",
  "stock-analysis": "해외주식 > 종목 분석",
  "news-issue": "해외주식 > 뉴스 & 이슈",
  "stock-tip": "정보/팁 > 투자 정보",
  "home-tip": "정보/팁 > 부동산 정보",
  "common-tip": "정보/팁 > 꿀팁",
};

// ------------------------------------------------------------------
// CLI
// ------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function todayKST(offsetDays = 0) {
  return new Date(Date.now() + 9 * 3600e3 + offsetDays * 86400e3).toISOString().slice(0, 10);
}

// ------------------------------------------------------------------
// 주제 큐 (automation/topics.md)
// ------------------------------------------------------------------
function nextQueuedTopic() {
  if (!fs.existsSync(TOPICS_FILE)) return null;
  const lines = fs.readFileSync(TOPICS_FILE, "utf8").split("\n");
  const idx = lines.findIndex((l) => /^\s*- \[ \] \S/.test(l));
  if (idx === -1) return null;
  const raw = lines[idx].replace(/^\s*- \[ \]\s*/, "").trim();
  // "주제 | category | 메모" 형식 지원
  const [topic, category, note] = raw.split("|").map((s) => s?.trim());
  return { lineIndex: idx, topic, category: category || undefined, note: note || undefined };
}

function markTopicDone(lineIndex, slug) {
  const lines = fs.readFileSync(TOPICS_FILE, "utf8").split("\n");
  lines[lineIndex] = lines[lineIndex].replace("- [ ]", "- [x]") + ` → ${slug} (${todayKST()})`;
  fs.writeFileSync(TOPICS_FILE, lines.join("\n"));
}

// ------------------------------------------------------------------
// 기존 글 목록 (중복 방지 + 내부 링크용)
// ------------------------------------------------------------------
function existingPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const title = text.match(/^title:\s*"(.*)"\s*$/m)?.[1] ?? f;
      const date = text.match(/^date:\s*"(.*)"\s*$/m)?.[1] ?? "";
      const category = text.match(/^category:\s*"(.*)"\s*$/m)?.[1] ?? "";
      return { slug: f.replace(/\.md$/, ""), title, date, category };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ------------------------------------------------------------------
// 프롬프트
// ------------------------------------------------------------------
function buildPrompts({ topic, category, note, publishDate, posts }) {
  const rule = fs.readFileSync(RULE_FILE, "utf8");
  const postList = posts.map((p) => `- [${p.date}] (${p.category}) ${p.title} → /posts/${p.slug}`).join("\n");
  const categoryList = Object.entries(AUTO_CATEGORIES).map(([s, n]) => `- ${s}: ${n}`).join("\n");

  const system = `당신은 '돈큐의 투자 인사이트'(donqlog.com) 블로그의 글 초안을 작성하는 어시스턴트입니다.
아래 rule.md는 이 블로그의 공식 작성 규칙이며 반드시 따라야 합니다.

<rule.md>
${rule}
</rule.md>

추가 규칙 (rule.md보다 우선):
1. 사실 확인: 실적 수치, 금리, 세율, 정책, 날짜 등 모든 사실은 웹 검색으로 확인한 최신 1차 출처(기업 IR·SEC 공시, 정부·기관 발표, 주요 언론)를 근거로 씁니다. 확인하지 못한 수치는 쓰지 않습니다.
2. 경험 날조 금지: 돈큐의 1인칭 말투는 유지하되, 실제로 해당 종목을 보유하고 있다거나 수익률·매매 내역·방문 경험 같은 개인 경험을 지어내지 않습니다. 개인 코멘트 섹션은 쓰지 않습니다(사람이 직접 추가).
3. 투자 유의: 특정 종목 매수·매도 권유 표현을 쓰지 않고, 마무리에 "투자 판단과 책임은 본인에게 있으며 상황에 따라 다를 수 있다"는 취지의 유의사항을 넣습니다.
4. 강조는 반드시 <strong>...</strong>. 마크다운 ** 는 절대 쓰지 않습니다.
5. 내부 링크: 아래 기존 글 중 자연스럽게 관련 있는 글이 있으면 본문에 1~2개 [제목](/posts/slug) 형태로 연결합니다. 없으면 넣지 않습니다.
6. 기존 글과 주제가 겹치면 각도를 바꾸거나(최신 분기 실적, 변경된 제도 등) 차별점을 명확히 합니다.
7. 분량: 본문 3,000~6,000자 내외. 표가 도움이 되면 GFM 표를 사용합니다.
8. 이미지: 커버는 자동 생성되므로 본문에 이미지 문법을 넣지 않습니다.

자동 작성 가능한 카테고리 (이 중에서만 선택):
${categoryList}

기존 발행 글:
${postList}

최종 출력 형식 (검색과 조사가 끝난 뒤, 마지막 응답에 아래 네 블록을 정확히 출력):
<meta>
{"slug": "핵심-키워드-영어-슬러그", "title": "글 제목", "excerpt": "160자 이내 요약", "category": "카테고리-슬러그"}
</meta>
<post>
(frontmatter 없이 마크다운 본문만. "안녕하세요, 돈큐입니다. 😊"로 시작)
</post>
<sources>
- [출처 제목](URL)
</sources>
<review_notes>
- 검토자가 꼭 확인해야 할 수치, 불확실한 부분, 개인 코멘트를 넣으면 좋을 위치
</review_notes>`;

  const task = topic
    ? `다음 주제로 블로그 글 초안을 작성해 주세요.\n주제: ${topic}${category ? `\n카테고리: ${category}` : ""}${note ? `\n메모: ${note}` : ""}`
    : `최근 1~2주 사이의 이슈 중 이 블로그 독자(미국 주식·국내 부동산·재테크에 관심 있는 한국 직장인)에게 검색 수요가 높을 주제 하나를 웹 검색으로 직접 골라 블로그 글 초안을 작성해 주세요. 우선순위: 최근 발표된 미국 AI·인프라 기업 실적, 국내 부동산·세금·대출 제도 변경, 재테크 실용 정보. 기존 글과 겹치지 않아야 합니다.`;

  const user = `${task}\n\n오늘 날짜(KST): ${todayKST()}\n발행 예정일: ${publishDate}\n\n조사를 충분히 한 뒤 지정된 출력 형식으로 답해 주세요.`;
  return { system, user };
}

// ------------------------------------------------------------------
// Claude API (https 모듈 사용: 긴 생성도 타임아웃 없이 대기)
// ------------------------------------------------------------------
function postJSON(url, body, headers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      url,
      { method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(data), ...headers } },
      (res) => {
        let chunks = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (chunks += c));
        res.on("end", () => {
          let json;
          try { json = JSON.parse(chunks); } catch { return reject(new Error(`HTTP ${res.statusCode}: ${chunks.slice(0, 500)}`)); }
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json.error ?? json)}`));
          resolve(json);
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function callClaude({ system, user }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY 환경 변수가 없습니다.");

  const messages = [{ role: "user", content: user }];
  const texts = [];
  const usage = { input_tokens: 0, output_tokens: 0, web_search_requests: 0 };

  for (let round = 1; round <= 6; round++) {
    console.log(`🤖 Claude 호출 (${MODEL}, round ${round})...`);
    const res = await postJSON(
      "https://api.anthropic.com/v1/messages",
      {
        model: MODEL,
        max_tokens: 16000,
        system,
        messages,
        tools: [{ type: "web_search_20260318", name: "web_search", max_uses: 15, response_inclusion: "excluded",
                  user_location: { type: "approximate", country: "KR", timezone: "Asia/Seoul" } }],
      },
      { "x-api-key": key, "anthropic-version": API_VERSION }
    );

    usage.input_tokens += res.usage?.input_tokens ?? 0;
    usage.output_tokens += res.usage?.output_tokens ?? 0;
    usage.web_search_requests += res.usage?.server_tool_use?.web_search_requests ?? 0;
    for (const b of res.content) if (b.type === "text") texts.push(b.text);

    if (res.stop_reason === "pause_turn") {
      // 서버 측 검색 루프가 길어 일시정지된 경우: 받은 그대로 돌려보내 이어서 진행
      messages.push({ role: "assistant", content: res.content });
      continue;
    }
    if (res.stop_reason === "max_tokens") throw new Error("출력이 max_tokens에서 잘렸습니다. 주제를 좁혀 다시 시도하세요.");
    console.log(`📊 사용량: 입력 ${usage.input_tokens} / 출력 ${usage.output_tokens} 토큰, 검색 ${usage.web_search_requests}회`);
    return { text: texts.join(""), usage };
  }
  throw new Error("pause_turn이 너무 많이 반복되었습니다.");
}

// ------------------------------------------------------------------
// 응답 파싱 + 규칙 보정
// ------------------------------------------------------------------
function pickTag(text, tag) {
  const all = [...text.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))];
  return all.length ? all[all.length - 1][1].trim() : null; // 마지막 블록 사용
}

function normalizeSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^\d{4}(-\d{2}-\d{2})?-/, "") // 날짜/연도 접두어 제거 (rule.md 1절)
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function uniqueSlug(slug) {
  let s = slug, n = 2;
  while (fs.existsSync(path.join(POSTS_DIR, `${s}.md`)) || fs.existsSync(path.join(ASSETS_DIR, s))) s = `${slug}-${n++}`;
  return s;
}

function fixBody(body) {
  return body
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>") // ** → <strong> (rule.md 3절)
    .replace(/^---\n[\s\S]*?\n---\n/, "") // 혹시 들어간 frontmatter 제거
    .trim();
}

function parseResponse(text) {
  const metaRaw = pickTag(text, "meta");
  const body = pickTag(text, "post");
  if (!metaRaw || !body) throw new Error("응답에서 <meta>/<post> 블록을 찾지 못했습니다.\n---\n" + text.slice(-2000));
  const meta = JSON.parse(metaRaw.replace(/^```(json)?|```$/g, "").trim());
  return {
    meta,
    body: fixBody(body),
    sources: pickTag(text, "sources") || "",
    reviewNotes: pickTag(text, "review_notes") || "",
  };
}

function yamlStr(s) {
  return JSON.stringify(String(s)); // YAML double-quoted 문자열과 호환
}

function buildMarkdown({ slug, title, excerpt, category, date, body }) {
  return `---
title: ${yamlStr(title)}
excerpt: ${yamlStr(excerpt)}
coverImage: "/assets/blog/${slug}/cover.png"
date: "${date}"
ogImage:
  url: "/assets/blog/${slug}/cover.png"
author:
  name: "돈큐"
  picture: "/assets/blog/authors/donq.webp"
preview: false
category: "${category}"
---

${body}
`;
}

// ------------------------------------------------------------------
// main
// ------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const publishDate = args.date || todayKST(1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) throw new Error(`--date 형식 오류: ${publishDate}`);

  let queued = null;
  let topic = args.topic, category = args.category, note;
  if (!topic) {
    queued = nextQueuedTopic();
    if (queued) ({ topic, category, note } = queued);
  }
  if (category && !AUTO_CATEGORIES[category]) throw new Error(`자동 작성 불가 카테고리: ${category}`);
  console.log(topic ? `📝 주제: ${topic}` : "📝 주제: 자동 선정");

  let text, usage = null;
  if (args["from-response"]) {
    text = fs.readFileSync(args["from-response"], "utf8");
  } else {
    const prompts = buildPrompts({ topic, category, note, publishDate, posts: existingPosts() });
    ({ text, usage } = await callClaude(prompts));
  }

  const { meta, body, sources, reviewNotes } = parseResponse(text);

  const finalCategory = category || meta.category;
  if (!AUTO_CATEGORIES[finalCategory]) throw new Error(`잘못된 카테고리: ${finalCategory}`);
  const slug = uniqueSlug(normalizeSlug(meta.slug));
  if (!slug) throw new Error("슬러그 생성 실패");
  const title = String(meta.title).trim();
  let excerpt = String(meta.excerpt || title).trim();
  if (excerpt.length > 160) excerpt = excerpt.slice(0, 157) + "...";

  const md = buildMarkdown({ slug, title, excerpt, category: finalCategory, date: publishDate, body });
  const postPath = path.join(POSTS_DIR, `${slug}.md`);
  fs.writeFileSync(postPath, md);
  console.log(`✅ 글 생성: ${path.relative(ROOT, postPath)}`);

  const coverPath = path.join(ASSETS_DIR, slug, "cover.png");
  await makeCover({ title, category: finalCategory, out: coverPath });
  console.log(`🖼️  커버 생성: ${path.relative(ROOT, coverPath)} (${Math.round(fs.statSync(coverPath).size / 1024)}KB)`);

  if (queued) markTopicDone(queued.lineIndex, slug);

  const metaOut = process.env.DRAFT_META_OUT || path.join(os.tmpdir(), "donq-draft-meta.json");
  fs.writeFileSync(
    metaOut,
    JSON.stringify({ slug, title, excerpt, category: finalCategory, date: publishDate, topic: topic || "(자동 선정)",
                     sources, reviewNotes, model: MODEL, usage }, null, 2)
  );
  console.log(`🗂️  메타데이터: ${metaOut}`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
