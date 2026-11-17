import Image from "next/image";
import { BrowserFrameProps } from "@/types";

// Screenshots are captured at 1440×900
const IMAGE_WIDTH = 1440;
const IMAGE_HEIGHT = 900;

const WINDOW_DOTS = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

export default function BrowserFrame({
  label,
  image,
  imageAlt,
  fallback,
  priority = false,
}: BrowserFrameProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          {WINDOW_DOTS.map((color) => (
            <span key={color} className={`h-2.5 w-2.5 rounded-full ${color}`} />
          ))}
        </div>
        <span className="truncate font-mono text-[10px] text-neutral-500">
          {label}
        </span>
      </div>
      {image ? (
        <Image
          src={image}
          alt={imageAlt ?? label}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="block h-auto w-full"
          priority={priority}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-dots bg-surface-raised px-6">
          <span className="text-center font-mono text-xs text-neutral-500">
            {fallback}
          </span>
        </div>
      )}
    </div>
  );
}
