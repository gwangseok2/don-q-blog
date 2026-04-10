import markdownStyles from "./markdown-styles.module.css";
import TableOfContents from "./table-of-contents";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  // 🚨 외부 링크를 새 탭에서 열리도록 처리 (보안 및 체류 시간 유지)
  const processedContent = content.replace(
    /<a href="(http[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );

  return (
    <div className="max-w-5xl mx-auto">
      <TableOfContents htmlContent={content} />
      <div className={markdownStyles["markdown"]} dangerouslySetInnerHTML={{ __html: processedContent }} />
    </div>
  );
}
