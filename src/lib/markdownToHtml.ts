import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    // 단일 물결표(~)는 취소선으로 처리하지 않음.
    // "뜨~끈하고 ... 생각나더라구요~" 같은 말투의 물결표 사이가 <del>(취소선)로 바뀌는 문제 방지.
    // 취소선이 필요하면 ~~텍스트~~ (물결표 두 개)를 사용.
    .use(gfm, { singleTilde: false })
    // 🚨 수정: remark-html에 { sanitize: false } 옵션을 추가하여
    // 모든 HTML 태그(<strong> 포함)를 필터링 없이 통과시키도록 설정합니다.
    .use(html, { sanitize: false })
    .process(markdown);

  let htmlString = result.toString();

  // 🚨 구글 검색 결과 '섹션 바로가기'를 위해 h2, h3에 내용 기반 ID 주입
  htmlString = htmlString.replace(/<h([23])>(.*?)<\/h\1>/g, (match, level, content) => {
    const id = content
      .replace(/<[^>]*>/g, "") // HTML 태그 제거
      .replace(/\s+/g, "-")    // 공백은 하이픈으로
      .toLowerCase()
      .replace(/[^\w\dㄱ-ㅎㅏ-ㅣ가-힣-]/g, ""); // 특수문자 제거 (한글 포함)
    return `<h${level} id="${id}">${content}</h${level}>`;
  });

  return htmlString;
}
