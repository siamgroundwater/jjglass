import type { Metadata } from 'next';
import { Locale, languageConfig, localizedPath } from './i18n';
export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: `${title} | JJGLASS` },
    description,
    alternates: {
      canonical: localizedPath(path || '/', locale),
      languages: {
        ...Object.fromEntries(languageConfig.order.map(l => [l, localizedPath(path || '/', l)])),
        'x-default': localizedPath(path || '/', languageConfig.default)
      }
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: languageConfig.openGraph[locale],
      images: [{
        url: '/images/hero.webp',
        width: 1536,
        height: 1024,
        alt: 'JJGLASS'
      }]
    }
  };
}
