import type { APIRoute } from 'astro';
import { getSiteConfig } from '@utils/config';

export const GET: APIRoute = () => {
    const siteConfig = getSiteConfig();

    const robotsTxt = [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
        '',
    ].join('\n');

    return new Response(robotsTxt, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
};