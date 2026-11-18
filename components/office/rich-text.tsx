import { RichTextProps } from "@/types";

export default function RichText({ segments }: RichTextProps) {
  return (
    <>
      {segments.map((segment) =>
        segment.href ? (
          <a
            key={segment.text}
            href={segment.href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-neutral-950"
          >
            {segment.text}
          </a>
        ) : (
          <span key={segment.text}>{segment.text}</span>
        )
      )}
    </>
  );
}
