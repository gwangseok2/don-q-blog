import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { BLOG_NAME, getBaseUrl } from "@/lib/constants";
import Script from "next/script";

// Header 컴포넌트에서 정의된 유효한 슬러그 목록 정보를 import 합니다.
import { CATEGORY_KEYS, CategorySlug } from "@/app/_components/header";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  const baseUrl = getBaseUrl();
  const description = post.excerpt || post.title;

  // ------------------------------------------------------------------
  // Header 컴포넌트 Props를 위한 타입 안정성 확보 로직
  // ------------------------------------------------------------------
  const rawCategorySlug: string = post.category; // 포스트의 카테고리 슬러그 (string 타입)

  // 유효성 검사: rawCategorySlug가 CATEGORY_KEYS에 포함되는지 확인
  const isCategoryValid = Object.keys(CATEGORY_KEYS).includes(rawCategorySlug);

  // safeCategorySlug: Header에 전달할 안전한 타입 (CategorySlug | undefined)
  const safeCategorySlug: CategorySlug | undefined = isCategoryValid
    ? (rawCategorySlug as CategorySlug) // 유효하면 CategorySlug 타입으로 단언
    : undefined; // 유효하지 않으면 undefined

  // categoryName: Header에 전달할 사람이 읽을 수 있는 카테고리 이름
  const categoryName = safeCategorySlug ? CATEGORY_KEYS[safeCategorySlug] : undefined;
  // ------------------------------------------------------------------

  return (
    <main>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            image: [`${baseUrl}${post.ogImage.url}`],
            author: {
              "@type": "Person",
              name: post.author.name,
            },
            datePublished: post.date,
            dateModified: post.date,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${baseUrl}/posts/${params.slug}`,
            },
          }),
        }}
      />
      <Alert preview={post.preview} />
      <Container>
        {/* safeCategorySlug와 categoryName을 Header에 전달 */}
        <Header categoryName={categoryName} categorySlug={safeCategorySlug} />
        <article className="mb-32 detail">
          <PostHeader title={post.title} coverImage={post.coverImage} date={post.date} author={post.author} />
          <PostBody content={content} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }
  const siteTitle = BLOG_NAME;
  const title = `${post.title} | ${siteTitle}`;
  const baseUrl = getBaseUrl();
  const description = post.excerpt || post.title;
  const url = `${baseUrl}/posts/${post.slug}`;

  return {
    title,
    description,

    // 캐노니컬
    alternates: {
      canonical: url,
    },

    // 로봇
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: siteTitle,
      locale: "ko_KR",
      images: [
        {
          url: `${baseUrl}${post.ogImage.url}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: `${baseUrl}${post.ogImage.url}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
