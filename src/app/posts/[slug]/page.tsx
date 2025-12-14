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

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  const baseUrl = getBaseUrl();
  const description = post.excerpt || post.title;

  const categoryName = post.slug;
  const categorySlug = post.category;

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
        <Header categoryName={categoryName} categorySlug={categorySlug} />
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
