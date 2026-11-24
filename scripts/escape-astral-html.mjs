#!/usr/bin/env node
/**
 * 빌드 결과물(out/*.html)의 4바이트 문자(이모지 등, U+10000 이상)를 ASCII 이스케이프로 바꿉니다.
 *
 * 왜 필요한가
 *   애드센스 "광고 설정 미리보기"의 Google 렌더러(UA에 GoogleAdSenseInfeed)는 HTML을 처리하면서
 *   이모지 같은 4바이트 문자를 "??"로 바꿉니다. Next.js는 페이지 데이터(RSC)를
 *   `self.__next_f.push([1,"..."])` 인라인 스크립트로 넣는데, 이 데이터는 "텍스트 N바이트" 형식이라
 *   이모지 하나(4바이트)가 "??"(2바이트)로 바뀌면 그 뒤 행 경계가 전부 어긋나
 *   `TypeError: t.reason.enqueueModel is not a function` → "Application error"로 페이지가 죽습니다.
 *
 * 무엇을 바꾸나 (브라우저가 해석한 결과는 원래와 완전히 같음)
 *   - <script> 안: JS 이스케이프  😊 → 😊
 *   - 일반 텍스트·속성: HTML 엔티티  😊 → &#x1F60A;
 *   - <style> 안: 그대로 둠
 *
 * 사용: next build 다음에 실행 (package.json의 build 스크립트)
 *   node scripts/escape-astral-html.mjs [디렉터리, 기본 out]
 */
import fs from "node:fs";
import path from "node:path";

const ASTRAL = /[\u{10000}-\u{10FFFF}]/gu;

const toJsEscape = (ch) => {
  const cp = ch.codePointAt(0) - 0x10000;
  const hi = 0xd800 + (cp >> 10);
  const lo = 0xdc00 + (cp & 0x3ff);
  return `\\u${hi.toString(16).toUpperCase()}\\u${lo.toString(16).toUpperCase()}`;
};
const toEntity = (ch) => `&#x${ch.codePointAt(0).toString(16).toUpperCase()};`;

/** HTML 한 장을 변환. <script>/<style> 블록과 나머지를 나눠서 처리합니다. */
export function escapeAstralInHtml(html) {
  let out = "";
  let last = 0;
  const block = /<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let m;
  while ((m = block.exec(html))) {
    out += html.slice(last, m.index).replace(ASTRAL, toEntity);
    const tag = m[1].toLowerCase();
    out += tag === "script" ? m[0].replace(ASTRAL, toJsEscape) : m[0];
    last = m.index + m[0].length;
  }
  out += html.slice(last).replace(ASTRAL, toEntity);
  return out;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && entry.name.endsWith(".html")) yield p;
  }
}

function main() {
  const dir = path.resolve(process.argv[2] || "out");
  if (!fs.existsSync(dir)) {
    console.error(`[escape-astral] 디렉터리가 없습니다: ${dir}`);
    process.exit(1);
  }
  let files = 0;
  let changed = 0;
  let chars = 0;
  for (const file of walk(dir)) {
    files++;
    const html = fs.readFileSync(file, "utf8");
    const count = (html.match(ASTRAL) || []).length;
    if (!count) continue;
    fs.writeFileSync(file, escapeAstralInHtml(html));
    changed++;
    chars += count;
  }
  console.log(`[escape-astral] HTML ${files}개 중 ${changed}개 변환, 4바이트 문자 ${chars}개 이스케이프`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
