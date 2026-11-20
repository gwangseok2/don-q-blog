import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), '_posts');
const CATEGORY_SLUGS = [
  'market-analysis', 'stock-analysis', 'trading-log', 'news-issue',
  'apartment-analysis',
  'food-review', 'daily', 'travel',
  'stock-tip', 'home-tip', 'common-tip'
];

// 사용법
//   node scripts/audit-posts.mjs                       전체 글 검사 (리포트만)
//   node scripts/audit-posts.mjs --strict a.md b.md    지정한 글만 검사, 문제 있으면 exit 1 (CI용)
//   --legacy-ok  이미 발행된 글을 수정할 때: 파일명 날짜 접두어·커버 경로 규칙은 건너뜀
//                (URL과 이미지 경로를 바꾸면 검색 색인·공유 링크가 깨지므로)
const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const LEGACY_OK = argv.includes('--legacy-ok');
const TARGETS = argv.filter(a => !a.startsWith('--')).map(a => path.basename(a)).filter(f => f.endsWith('.md'));
const MAX_IMAGE_BYTES = 1024 * 1024;

function audit() {
  const files = TARGETS.length
    ? TARGETS.filter(f => fs.existsSync(path.join(POSTS_DIR, f)))
    : fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  console.log(`Auditing ${files.length} posts...\n`);

  let issuesFound = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    const contentStr = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(contentStr);

    const issues = [];

    // 1. Filename check
    const datePrefixRegex = /^\d{4}-\d{2}-\d{2}-/;
    const yearPrefixRegex = /^\d{4}-/;
    if (!LEGACY_OK && (datePrefixRegex.test(file) || yearPrefixRegex.test(file))) {
      issues.push(`Filename has date/year prefix: "${file}"`);
    }

    // 2. Bold syntax check (**)
    if (content.includes('**')) {
      issues.push(`Content contains '**' bold formatting`);
    }

    // 3. Category matching
    if (!data.category) {
      issues.push(`Missing category in frontmatter`);
    } else if (!CATEGORY_SLUGS.includes(data.category)) {
      issues.push(`Invalid category: "${data.category}" (not in permitted list)`);
    }

    // 4. Cover image path matching slug
    const slug = file.replace(/\.md$/, '');
    // Wait, if the filename has a date prefix, let's see what slug it's expecting
    const expectedSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/^\d{4}-/, '');
    
    if (data.coverImage) {
      const coverImageRegex = new RegExp(`^/assets/blog/${slug}/cover\\.(png|jpe?g|webp)$`);
      const optimizedCoverImageRegex = new RegExp(`^/assets/blog/${expectedSlug}/cover\\.(png|jpe?g|webp)$`);
      if (!LEGACY_OK && !coverImageRegex.test(data.coverImage) && !optimizedCoverImageRegex.test(data.coverImage)) {
        issues.push(`coverImage path "${data.coverImage}" does not match "/assets/blog/[slug]/cover.(png|jpg|webp)"`);
      }
    } else {
      issues.push(`Missing coverImage in frontmatter`);
    }

    if (data.ogImage && data.ogImage.url) {
      const ogImageRegex = new RegExp(`^/assets/blog/${slug}/cover\\.(png|jpe?g|webp)$`);
      const optimizedOgImageRegex = new RegExp(`^/assets/blog/${expectedSlug}/cover\\.(png|jpe?g|webp)$`);
      if (!LEGACY_OK && !ogImageRegex.test(data.ogImage.url) && !optimizedOgImageRegex.test(data.ogImage.url)) {
        issues.push(`ogImage.url path "${data.ogImage.url}" does not match "/assets/blog/[slug]/cover.(png|jpg|webp)"`);
      }
    } else {
      issues.push(`Missing ogImage.url in frontmatter`);
    }

    // 5. Date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date || ''))) {
      issues.push(`date must be "YYYY-MM-DD": "${data.date}"`);
    }
    if (data.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.updated))) {
      issues.push(`updated must be "YYYY-MM-DD": "${data.updated}"`);
    }

    // 5-1. 이미지 alt에 의미 없는 기본 문구가 남아 있는지
    const placeholderAlts = [...content.matchAll(/!\[(이미지 설명|image|)\]\(/g)].length;
    if (placeholderAlts > 0) {
      issues.push(`Image alt is empty or placeholder ("이미지 설명") in ${placeholderAlts} image(s)`);
    }

    // 6. Images exist and are <= 1MB (cover + body images under /assets/blog/)
    const imagePaths = new Set();
    if (data.coverImage) imagePaths.add(data.coverImage);
    for (const m of content.matchAll(/!\[[^\]]*\]\((\/assets\/blog\/[^)\s]+)\)/g)) imagePaths.add(m[1]);
    for (const img of imagePaths) {
      const abs = path.join(process.cwd(), 'public', img);
      if (!fs.existsSync(abs)) {
        issues.push(`Image not found: ${img}`);
      } else if (fs.statSync(abs).size > MAX_IMAGE_BYTES) {
        issues.push(`Image over 1MB: ${img} (${Math.round(fs.statSync(abs).size / 1024)}KB)`);
      }
    }

    if (issues.length > 0) {
      console.log(`❌ File: ${file}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      issuesFound += issues.length;
    }
  });

  console.log(`\nAudit completed. Total issues found: ${issuesFound}`);
  if (STRICT && issuesFound > 0) process.exit(1);
}

audit();
