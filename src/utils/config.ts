/**
 * Configuration helpers for reading and adapting site settings.
 */

import originalSiteConfigFromFile from '../config/site.json';

export interface SiteConfig {
  site: SiteSubConfig;
  giscus: {
    enabled: boolean;
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    strict: string;
    theme: string;
    reactionsEnabled: boolean;
    emitMetadata: boolean;
    inputPosition: string;
    lang: string;
    loading: string;
  };
  seo: {
    openGraph: {
      twitterCreator: string;
      defaultImageWidth: number;
      defaultImageHeight: number;
    };
    analytics: {
      googleAnalyticsId: string;
      baiduAnalyticsId: string;
    };
  };
  social: {
    twitter?: string;
    github: string;
    linkedin: string;
  };
  features: {
    darkMode: boolean;
    tableOfContents: boolean;
    readingTime: boolean;
    search: boolean;
    comments: boolean;
  };
  navigation?: {
    header: NavItem[];
    footer: NavItem[];
  };
}

export interface SiteSubConfig {
  title: string;
  description: string;
  url: string;
  author: string;
  email: string;
  logo: string;
  homeTitle: string;
  homeSubtitle: string;
  blogSubtitle: string;
  projectSubtitle: string;
  brandTitle: string;
}

export interface DynamicSiteConfig extends SiteSubConfig {
  base: string;
}

export interface NavItem {
  text: string;
  href: string;
}

const originalSiteConfig = originalSiteConfigFromFile as SiteConfig;
const defaultNavigation: NonNullable<SiteConfig['navigation']> = {
  header: [],
  footer: []
};

export function getConfig(): SiteConfig {
  return originalSiteConfig;
}

export function getSiteConfig(): DynamicSiteConfig {
  const deployEnv = process.env.DEPLOY_ENV || 'LOCAL';
  const githubRepoName = process.env.GITHUB_REPO_NAME || 'JiaheLv.github.io';
  const githubActor = process.env.GITHUB_ACTOR || 'JiaheLv';
  const baseSiteDetails = { ...originalSiteConfig.site };

  let dynamicUrl: string;
  let dynamicBase: string;

  switch (deployEnv) {
    case 'DEMO_GITHUB_PAGES':
    case 'GITHUB_PAGES': {
      const githubUser = githubActor.toLowerCase();

      if (githubRepoName.toLowerCase() === `${githubUser}.github.io`) {
        dynamicUrl = `https://${githubUser}.github.io`;
        dynamicBase = '/';
      } else {
        dynamicUrl = `https://${githubUser}.github.io`;
        dynamicBase = `/${githubRepoName}`;
      }
      break;
    }
    case 'MAIN_CLOUDFLARE':
      dynamicUrl = originalSiteConfig.site.url;
      dynamicBase = '/';
      break;
    default:
      dynamicUrl = originalSiteConfig.site.url || 'http://localhost:4321';
      dynamicBase = '/';
      break;
  }

  return {
    ...baseSiteDetails,
    url: dynamicUrl,
    base: dynamicBase
  };
}

export function getGiscusConfig() {
  return originalSiteConfig.giscus;
}

export function getSeoConfig() {
  return originalSiteConfig.seo;
}

export function getSocialConfig() {
  return originalSiteConfig.social;
}

export function getFeaturesConfig() {
  return originalSiteConfig.features;
}

export function getNavigationConfig(): NonNullable<SiteConfig['navigation']> {
  return originalSiteConfig.navigation ?? defaultNavigation;
}

export function isFeatureEnabled(featureName: keyof SiteConfig['features']): boolean {
  return originalSiteConfig.features[featureName] === true;
}

export function formatPageTitle(pageTitle: string): string {
  const siteDetails = getSiteConfig();
  return `${pageTitle} | ${siteDetails.title}`;
}

export default {
  getConfig,
  getSiteConfig,
  getGiscusConfig,
  getSeoConfig,
  getSocialConfig,
  getFeaturesConfig,
  getNavigationConfig,
  isFeatureEnabled,
  formatPageTitle
};
