import { client } from './sanity';

export const getAllPosts = async () => {
  const query = `*[]`; // This will return ALL documents regardless of type
  try {
    const posts = await client.fetch(query);
    console.log('All documents:', posts);

    // Also check specifically for post types
    const postTypeQuery = `*[_type == "post"]`;
    const postDocs = await client.fetch(postTypeQuery);
    console.log('Documents with _type "post":', postDocs);

    return postDocs;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPostBySlug(slug) {
  const query = `*[_type == "post" && slug.current == $slug] {
    _id,
    "slug": slug.current, 
    title,
    publishedAt,
    body
  }`;
  const params = { slug };
  const post = await client.fetch(query, params);
  return post[0];
}
