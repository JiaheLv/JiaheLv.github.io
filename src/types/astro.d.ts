/**
 * Global component type definitions
 */
declare namespace Astro {
  /**
   * Article card component properties
   */
  interface ArticleCardProps {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    heroImage?: string;
    tags?: string[];
    author?: string;
    slug: string;
  }

}
 