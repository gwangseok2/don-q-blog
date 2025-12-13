import ogImage from "../../public/assets/blog/authors/donq.png";

export const EXAMPLE_PATH = "blog-starter";
export const CMS_NAME = "Markdown";
export const HOME_OG_IMAGE_URL = {
  url: ogImage.src, // ✨ import된 이미지 객체에서 .src 속성을 추출하여 문자열 URL 사용
  width: 1200, // OG 권장 너비
  height: 630, // OG 권장 높이
  alt: "돈큐(Don Q) 블로그 기본 이미지",
};

export const BLOG_NAME = "돈큐의 투자 인사이트(dev01)";
