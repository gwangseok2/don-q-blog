import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const POSTS_DIR = path.join(process.cwd(), '_posts');
const ASSETS_DIR = path.join(process.cwd(), 'public/assets/blog');

const categories = {
    '1': 'market-analysis',
    '2': 'stock-analysis',
    '3': 'trading-log',
    '4': 'news-issue',
    '5': 'food-review',
    '6': 'daily',
    '7': 'travel',
    '8': 'stock-tip',
    '9': 'home-tip',
    '10': 'common-tip'
};

const categoryNames = {
    '1': '해외주식-시장분석',
    '2': '해외주식-종목분석',
    '3': '해외주식-매매일지',
    '4': '해외주식-뉴스/이슈',
    '5': '라이프-맛집',
    '6': '라이프-일상',
    '7': '라이프-여행',
    '8': '정보/팁-투자정보',
    '9': '정보/팁-부동산',
    '10': '정보/팁-꿀팁'
};

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // 스페이스를 하이픈으로
        .replace(/[^\w\-]+/g, '') // 영문, 숫자, 하이픈 외 제거
        .replace(/\-\-+/g, '-');  // 하이픈 중복 제거
}

async function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
    console.log('🚀 돈큐 블로그 새 글 생성 도우미');

    const title = await ask('📝 글 제목 (한글): ');
    if (!title) {
        console.error('❌ 제목은 필수입니다.');
        process.exit(1);
    }

    console.log('\n📍 카테고리를 선택하세요:');
    Object.entries(categoryNames).forEach(([key, name]) => {
        console.log(`${key}. ${name}`);
    });

    const catKey = await ask('번호 입력: ');
    const category = categories[catKey];
    if (!category) {
        console.error('❌ 잘못된 카테고리 번호입니다.');
        process.exit(1);
    }

    let slug = await ask('\n🔗 영어 슬러그 (엔터 시 제목 기반 자동 생성): ');
    if (!slug) {
        slug = slugify(title);
        if (!slug) {
            slug = 'new-post-' + Date.now();
        }
    }

    const date = new Date().toISOString().split('T')[0];
    const fileName = `${slug}.md`;
    const filePath = path.join(POSTS_DIR, fileName);
    const assetDirPath = path.join(ASSETS_DIR, slug);

    const frontmatter = `---
title: "${title}"
excerpt: "${title}에 대한 포스팅입니다."
coverImage: "/assets/blog/${slug}/cover.png"
date: "${date}"
ogImage:
  url: "/assets/blog/${slug}/cover.png"
author:
  name: "돈큐"
  picture: "/assets/blog/authors/donq.png"
preview: false
category: "${category}"
---

안녕하세요, 돈큐입니다. 😊

## 1. 주제 선정 배경

---

## 2. 주요 내용

---

## 💡 마치며

---

## ✍️ 개인적인 코멘트
`;

    // 파일 및 폴더 생성
    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
    if (!fs.existsSync(assetDirPath)) fs.mkdirSync(assetDirPath, { recursive: true });

    if (fs.existsSync(filePath)) {
        console.error(`\n❌ 이미 존재하는 파일명입니다: ${fileName}`);
        process.exit(1);
    }

    fs.writeFileSync(filePath, frontmatter);
    console.log(`\n✅ 새 글이 생성되었습니다: ${filePath}`);
    console.log(`✅ 이미지 폴더가 생성되었습니다: ${assetDirPath}`);
    console.log('\n💡 /assets/blog/[slug]/ 경로에 cover.png를 꼭 넣어주세요!');

    rl.close();
}

main();
