import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    // 보안: 로컬(개발) 환경에서만 작동하도록 제한
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: '상용 환경에서는 사용할 수 없습니다.' }, { status: 403 });
    }

    try {
        const { title, excerpt, category, slug, content } = await request.json();

        if (!title || !category || !slug) {
            return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
        }

        const POSTS_DIR = path.join(process.cwd(), '_posts');
        const ASSETS_DIR = path.join(process.cwd(), 'public/assets/blog');

        const date = new Date().toISOString().split('T')[0];
        const fileName = `${slug}.md`;
        const filePath = path.join(POSTS_DIR, fileName);
        const assetDirPath = path.join(ASSETS_DIR, slug);

        const frontmatter = `---
title: "${title}"
excerpt: "${excerpt || title + '에 대한 포스팅입니다.'}"
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

${content}
`;

        // 파일 및 폴더 생성
        if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
        if (!fs.existsSync(assetDirPath)) fs.mkdirSync(assetDirPath, { recursive: true });

        if (fs.existsSync(filePath)) {
            return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 409 });
        }

        fs.writeFileSync(filePath, frontmatter, 'utf-8');

        return NextResponse.json({ success: true, path: filePath });
    } catch (error: any) {
        console.error('Save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
