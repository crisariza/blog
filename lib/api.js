
import { client } from './sanity';

export async function getAllPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    "slug": slug.current, 
    title,
    publishedAt,
    mainImage
  }`;
  const posts = await client.fetch(query);
  return posts;
}

export async function getPostBySlug(slug) {
  const query = `*[_type == "post" && slug.current == $slug] {
    _id,
    "slug": slug.current, 
    title,
    publishedAt,
    mainImage,
    body
  }`;
  const params = { slug };
  const post = await client.fetch(query, params);
  return post[0];
}
