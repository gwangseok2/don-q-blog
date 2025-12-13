import Container from "@/app/_components/container";
import { BLOG_NAME } from "@/lib/constants";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 dark:bg-slate-800 dark:border-neutral-700">
      <Container>
        {/* 기존 컨테이너 제거하고 필수 정보와 링크만 남김 */}
        <div className="py-12 flex flex-col items-center">
          {/* 블로그 제목 및 저작권 정보 */}
          <h3 className="text-2xl font-bold tracking-tight text-center mb-6 text-gray-800 dark:text-white">
            <Link href="/" className="hover:underline">
              {BLOG_NAME}
            </Link>
          </h3>

          {/* 필수 링크 섹션 */}
          <div className="flex flex-col lg:flex-row justify-center items-center">
            <ul className="flex flex-wrap justify-center space-x-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li>
                <a href="/page-info/about" className="hover:underline">
                  소개
                </a>
              </li>
              <li>
                <a href="/page-info/contact" className="hover:underline">
                  문의
                </a>
              </li>
              <span className="text-gray-300 dark:text-gray-600">|</span> {/* 구분자 */}
              <li>
                <a href="/page-info/privacy-policy" className="hover:underline text-gray-700 dark:text-gray-200">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="/page-info/terms-of-service" className="hover:underline text-gray-700 dark:text-gray-200">
                  이용 약관 및 면책 조항
                </a>
              </li>
            </ul>
          </div>

          {/* 저작권 및 면책 문구 */}
          <div className="mt-8 text-xs text-center text-gray-400">
            © {currentYear} {BLOG_NAME}. All rights reserved. <br />
            <p className="mt-1">
              <span className="font-bold text-red-500 dark:text-red-400">면책 조항:</span> 본 사이트의 모든 정보는 투자
              권유가 아닙니다. 투자 책임은 본인에게 있습니다.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
