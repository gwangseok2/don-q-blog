import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export function PostTitle({ children }: Props) {
  return (
    // md:leading-none
    // md 모바일 lg pc인듯
    <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold tracking-tighter leading-tight mb-12 text-center md:text-left break-keep">
      {children}
    </h1>
  );
}
