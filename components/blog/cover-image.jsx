import cn from "classnames";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { client } from "../../lib/sanity";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const CoverImage = ({ title, src, slug }) => {
  const image = src ? (
    <Image
      src={urlFor(src).url()}
      alt={`Cover Image for ${title}`}
      width={200}
      height={200}
      className={cn("rounded-lg w-full h-full object", {
        "rounded-lg": slug,
      })}
    />
  ) : (
    ""
  );
  return (
    <>
      {slug ? (
        <Link as={`/blog/${slug}`} href="/blog/[slug]" aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </>
  );
};

export default CoverImage;
