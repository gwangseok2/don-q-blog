#!/usr/bin/env node
/**
 * 글 이미지 최적화: PNG/JPG → WebP 변환 + 마크다운 경로 자동 수정
 *
 *   node scripts/optimize-images.mjs            변환 실행
 *   node scripts/optimize-images.mjs --dry-run  변경 예정만 출력
 *
 * 규칙
 *   - coverImage      → cover.webp (가로 최대 1200px)            : 페이지 표시용
 *   - ogImage.url     → cover.jpg  (가로 최대 1200px, mozjpeg)   : 카톡·페북 등 링크 미리보기 호환용
 *   - author.picture  → .webp (최대 400px)                       : 아바타
 *   - 본문 이미지     → .webp (가로 최대 1600px)
 *   - 변환 후 어디서도 참조하지 않는 원본은 삭제 (src/에서 import 하는 파일은 유지)
 *   - 이미 .webp 인 이미지는 건너뜀 → 새 글을 추가한 뒤 다시 실행해도 안전
 *
 * 의존성: sharp (Next.js 설치 시 함께 설치됨)
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const POSTS_DIR = path.join(ROOT, "_posts");
const DRY = process.argv.includes("--dry-run");

const RASTER = /\.(png|jpe?g)$/i;
const REF_RE = /\/assets\/blog\/[^"'()\s]+?\.(?:png|jpe?g)/gi;

const kb = (n) => `${Math.round(n / 1024)}KB`;
const abs = (p) => path.join(PUBLIC, p);

async function convert(src, dest, { width, format }) {
  let img = sharp(abs(src), { failOn: "none" }).rotate(); // EXIF 회전 반영
  const meta = await img.metadata();
  if (meta.width && meta.width > width) img = img.resize({ width, withoutEnlargement: true });
  if (format === "webp") img = img.webp({ quality: 80, effort: 5 });
  else img = img.flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true, progressive: true });
  const buf = await img.toBuffer();
  if (!DRY) fs.writeFileSync(abs(dest), buf);
  return buf.length;
}

function swapExt(p, ext) {
  return p.replace(RASTER, `.${ext}`);
}

async function main() {
  const posts = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const done = new Map(); // `${src}|${format}|${width}` → { dest, before, after }
  const touchedOriginals = new Set();
  let changedPosts = 0;

  for (const file of posts) {
    const filePath = path.join(POSTS_DIR, file);
    const text = fs.readFileSync(filePath, "utf8");
    const fm = text.match(/^---\n[\s\S]*?\n---/)?.[0] ?? "";
    const coverRef = fm.match(/^coverImage:\s*"([^"]+)"/m)?.[1];
    const ogRef = fm.match(/^ogImage:\s*\n\s+url:\s*"([^"]+)"/m)?.[1];
    const pictureRef = fm.match(/^\s+picture:\s*"([^"]+)"/m)?.[1];

    const replacements = []; // [from, to, scope]

    async function plan(ref, { format, width, scope }) {
      if (!ref || !RASTER.test(ref) || !fs.existsSync(abs(ref))) return;
      // 이미 jpg인 OG 이미지는 300KB 이하면 건너뜀 (재실행 시 반복 압축으로 화질 저하 방지)
      if (format === "jpeg" && /\.jpe?g$/i.test(ref) && fs.statSync(abs(ref)).size <= 300 * 1024) return;
      const key = `${ref}|${format}|${width}`;
      if (!done.has(key)) {
        const dest = swapExt(ref, format === "webp" ? "webp" : "jpg");
        const before = fs.statSync(abs(ref)).size;
        let after = await convert(ref, dest, { width, format });
        let finalDest = dest;
        // 같은 확장자 재압축(jpg→jpg)인데 더 커지면 원본 유지
        if (dest === ref && after >= before) { after = before; finalDest = ref; }
        done.set(key, { dest: finalDest, before, after });
      }
      const { dest } = done.get(key);
      if (dest !== ref) {
        replacements.push([ref, dest, scope]);
        touchedOriginals.add(ref);
      }
    }

    await plan(coverRef, { format: "webp", width: 1200, scope: "cover" });
    await plan(ogRef, { format: "jpeg", width: 1200, scope: "og" });
    await plan(pictureRef, { format: "webp", width: 400, scope: "picture" });

    const body = text.slice(fm.length);
    for (const ref of new Set(body.match(REF_RE) || [])) {
      await plan(ref, { format: "webp", width: 1600, scope: "body" });
    }

    if (!replacements.length) continue;

    let out = fm, rest = body;
    for (const [from, to, scope] of replacements) {
      if (scope === "cover") out = out.replace(`coverImage: "${from}"`, `coverImage: "${to}"`);
      else if (scope === "og") out = out.replace(new RegExp(`(ogImage:\\s*\\n\\s+url:\\s*)"${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `$1"${to}"`);
      else if (scope === "picture") out = out.replace(`picture: "${from}"`, `picture: "${to}"`);
      else rest = rest.split(from).join(to);
    }
    if (!DRY) fs.writeFileSync(filePath, out + rest);
    changedPosts++;
  }

  // 더 이상 참조되지 않는 원본 삭제
  const corpus = [
    ...posts.map((f) => fs.readFileSync(path.join(POSTS_DIR, f), "utf8")),
    ...walk(path.join(ROOT, "src")).map((f) => fs.readFileSync(f, "utf8")),
    ...(fs.existsSync(path.join(ROOT, "_pages")) ? walk(path.join(ROOT, "_pages")).map((f) => fs.readFileSync(f, "utf8")) : []),
  ].join("\n");
  const deleted = [];
  const kept = [];
  for (const ref of touchedOriginals) {
    const stillUsed = corpus.includes(ref) || corpus.includes(`public${ref}`);
    if (stillUsed) { kept.push(ref); continue; }
    deleted.push(ref);
    if (!DRY) fs.unlinkSync(abs(ref));
  }

  // 리포트
  let before = 0, after = 0;
  const rows = [...done.entries()].map(([key, v]) => {
    before += v.before; after += v.after;
    return `${kb(v.before).padStart(7)} → ${kb(v.after).padStart(6)}  ${key.split("|")[0]} → ${path.basename(v.dest)}`;
  });
  console.log(rows.join("\n"));
  console.log(`\n${DRY ? "[dry-run] " : ""}변환 ${done.size}건, 수정한 글 ${changedPosts}개`);
  console.log(`변환 대상 용량: ${kb(before)} → ${kb(after)} (${before ? Math.round((1 - after / before) * 100) : 0}% 감소)`);
  console.log(`원본 삭제 ${deleted.length}건, 다른 곳에서 참조 중이라 유지 ${kept.length}건${kept.length ? ": " + kept.join(", ") : ""}`);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : /\.(tsx?|jsx?|mjs|md|json|css)$/.test(d.name) ? [path.join(dir, d.name)] : []
  );
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
