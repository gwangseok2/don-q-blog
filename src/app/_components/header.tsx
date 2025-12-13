import Link from "next/link";
import { BLOG_NAME } from "@/lib/constants";

const Header = () => {
  return (
    <h2 className="text-2xl md:text-2xl font-bold tracking-tight md:tracking-tighter leading-tight mb-10 mt-8 flex items-center">
      <Link href="/" className="hover:underline">
        {BLOG_NAME}
      </Link>
    </h2>
  );
};

export default Header;
