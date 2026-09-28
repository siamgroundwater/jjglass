import type { MetadataRoute } from 'next';
import { languageConfig, localizedPath } from '@/lib/i18n';
import { products } from '@/lib/catalog';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjglass.com';
  return languageConfig.order.flatMap(locale => ['', '/products', '/brands', '/catalog', '/about', '/stores', '/contact', '/inspiration', ...products.map(p => `/products/${p.slug}`)].map(path => ({
    url: `${origin}${localizedPath(path || '/', locale)}`,
    alternates: {
      languages: Object.fromEntries(languageConfig.order.map(l => [l, `${origin}${localizedPath(path || '/', l)}`]))
    }
  })));
}
