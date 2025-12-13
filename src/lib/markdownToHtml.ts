import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(gfm)
    // 🚨 수정: remark-html에 { sanitize: false } 옵션을 추가하여
    // 모든 HTML 태그(<strong> 포함)를 필터링 없이 통과시키도록 설정합니다.
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}
