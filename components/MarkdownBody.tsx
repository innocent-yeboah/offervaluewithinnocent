import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose-letter font-serif text-lg leading-relaxed text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
