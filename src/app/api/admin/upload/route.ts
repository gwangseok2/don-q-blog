import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: '상용 환경에서는 사용할 수 없습니다.' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const slug = formData.get('slug') as string;

        if (!file || !slug) {
            return NextResponse.json({ error: '파일과 슬러그가 필요합니다.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ASSETS_DIR = path.join(process.cwd(), 'public/assets/blog', slug);
        if (!fs.existsSync(ASSETS_DIR)) {
            fs.mkdirSync(ASSETS_DIR, { recursive: true });
        }

        // 파일명 결정 (커버 이미지면 cover.png, 아니면 원본명 유지)
        const isCover = formData.get('isCover') === 'true';
        const fileName = isCover ? 'cover.png' : file.name;
        const filePath = path.join(ASSETS_DIR, fileName);

        fs.writeFileSync(filePath, buffer);

        const publicPath = `/assets/blog/${slug}/${fileName}`;
        return NextResponse.json({ success: true, url: publicPath });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
