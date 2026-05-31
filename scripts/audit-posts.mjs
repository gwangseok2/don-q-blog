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

function audit() {
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
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
    if (datePrefixRegex.test(file) || yearPrefixRegex.test(file)) {
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
      const coverImageRegex = new RegExp(`^/assets/blog/${slug}/cover\\.png$`);
      const optimizedCoverImageRegex = new RegExp(`^/assets/blog/${expectedSlug}/cover\\.png$`);
      if (!coverImageRegex.test(data.coverImage) && !optimizedCoverImageRegex.test(data.coverImage)) {
        issues.push(`coverImage path "${data.coverImage}" does not match "/assets/blog/[slug]/cover.png"`);
      }
    } else {
      issues.push(`Missing coverImage in frontmatter`);
    }

    if (data.ogImage && data.ogImage.url) {
      const ogImageRegex = new RegExp(`^/assets/blog/${slug}/cover\\.png$`);
      const optimizedOgImageRegex = new RegExp(`^/assets/blog/${expectedSlug}/cover\\.png$`);
      if (!ogImageRegex.test(data.ogImage.url) && !optimizedOgImageRegex.test(data.ogImage.url)) {
        issues.push(`ogImage.url path "${data.ogImage.url}" does not match "/assets/blog/[slug]/cover.png"`);
      }
    } else {
      issues.push(`Missing ogImage.url in frontmatter`);
    }

    if (issues.length > 0) {
      console.log(`❌ File: ${file}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      issuesFound += issues.length;
    }
  });

  console.log(`\nAudit completed. Total issues found: ${issuesFound}`);
}

audit();
