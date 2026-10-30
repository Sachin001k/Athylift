import { useEffect } from 'react';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://athylift.com').replace(/\/$/, '');
export const SITE_NAME = 'Athylift';
export const DEFAULT_TITLE = 'Athylift — Support athletes, break financial barriers';
export const DEFAULT_DESCRIPTION =
  'Athylift connects underprivileged athletes with donors who help fund equipment, coaching, training and academy fees.';

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

export type PageMeta = {
  // Page name only; " · Athylift" is appended. Omit for the home page title.
  title?: string;
  description?: string;
  path: string;
  // Private pages (dashboard, forms) are kept out of search results.
  noindex?: boolean;
};

export const applyPageMeta = ({ title, description = DEFAULT_DESCRIPTION, path, noindex = false }: PageMeta) => {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  document.title = fullTitle;
  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setCanonical(url);
};

// For pages whose title depends on loaded data (an athlete or a request).
export const usePageMeta = (meta: PageMeta | null) => {
  const key = meta ? JSON.stringify(meta) : '';
  useEffect(() => {
    if (meta) applyPageMeta(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};
