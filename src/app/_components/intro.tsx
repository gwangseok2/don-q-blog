import { BLOG_NAME } from "@/lib/constants";

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex lg:items-center md:justify-between mt-8 mb-16 md:mb-12">
      <h1 className="lg:text-5xl text-2xl font-bold tracking-tighter leading-tight md:pr-8">{BLOG_NAME}</h1>
      {/* <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        A statically generated blog example using{" "}
        <a href="https://nextjs.org/" className="underline hover:text-blue-600 duration-200 transition-colors">
          Next.js
        </a>{" "}
        and {CMS_NAME}.
      </h4> */}
    </section>
  );
}
