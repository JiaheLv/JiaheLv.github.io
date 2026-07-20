import { defineCollection, z } from 'astro:content';
import { getSiteConfig } from '../utils/config';

const siteConfig = getSiteConfig();

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    subject: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    author: z.string().default(siteConfig.author),
    location: z.string().default('')
  })
});

export const collections = {
  blogs: blogCollection
};