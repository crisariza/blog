import DateFormatter from "@/components/blog/date-formatter";

interface PostHeaderProps {
  title: string;
  publishedAt: string;
}

export default function PostHeader({ title, publishedAt }: PostHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-200 mb-2">
        {title}
      </h1>
      <DateFormatter publishedAt={publishedAt} />
    </div>
  );
}
