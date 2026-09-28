import { notFound } from 'next/navigation';
import { products } from '@/lib/catalog';
import { isLocale, languageConfig } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { ProductDetail } from '@/components/ProductDetail';
export function generateStaticParams() {
  return languageConfig.order.flatMap(locale => products.map(p => ({
    locale,
    slug: p.slug
  })));
}
export async function generateMetadata({
  params
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const {
    locale,
    slug
  } = await params;
  const p = products.find(p => p.slug === slug);
  if (!isLocale(locale) || !p) return {};
  return pageMetadata(locale, `/products/${p.slug}`, p.name[locale], p.description[locale]);
}
export default async function Page({
  params
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const {
    locale,
    slug
  } = await params;
  const product = products.find(p => p.slug === slug);
  if (!isLocale(locale) || !product) notFound();
  return <>
    <ProductDetail locale={locale} product={product} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name[locale],
        description: product.description[locale],
        sku: product.sku,
        image: `https://jjglass.com${product.image}`,
        brand: {
          '@type': 'Brand',
          name: product.brand
        }
      }).replace(/</g, '\\u003c')
    }} />
  </>;
}
