import sanityClient from '@sanity/client';

export const client = sanityClient({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_DATASET,
    apiVersion: '2021-03-25',
    useCdn: false
});