import { client } from "@/lib/sanity";
import { Post } from "@/lib/types";

export const getAllPosts = async (): Promise<Post[]> => {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    "slug": slug.current, 
    title,
    publishedAt
  }`;
  const posts = await client.fetch<Post[]>(query);
  return posts;
};

interface GetPostBySlugParams {
  slug: string;
}

export async function getPostBySlug({
  slug,
}: GetPostBySlugParams): Promise<Post | undefined> {
  const query = `*[_type == "post" && slug.current == $slug] {
    _id,
    "slug": slug.current, 
    title,
    publishedAt,
    body
  }`;
  const params = { slug };
  const post = await client.fetch<Post[]>(query, params);
  return post[0];
}
