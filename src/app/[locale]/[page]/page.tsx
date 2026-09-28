import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cmsPath, isLocale, copy, t, languageConfig } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import ProductListing from '@/components/ProductListing';
import { Commerce } from '@/components/Commerce';
import { ContentPages } from '@/components/ContentPages';
const pageNames = ['products', 'wishlist', 'cart', 'checkout', 'brands', 'catalog', 'about', 'stores', 'contact', 'inspiration', 'studio'] as const;
type PageName = typeof pageNames[number];
export function generateStaticParams() {
  return languageConfig.order.flatMap(locale => pageNames.map(page => ({
    locale,
    page
  })));
}
export async function generateMetadata({
  params
}: {
  params: Promise<{
    locale: string;
    page: string;
  }>;
}) {
  const {
    locale,
    page
  } = await params;
  if (!isLocale(locale) || !pageNames.includes(page as PageName)) return {};
  const names = {
    ...copy[locale],
    wishlist: copy[locale].saved,
    studio: t(locale, "Management preview")
  };
  const title = names[page as keyof typeof names] || 'JJGLASS';
  return pageMetadata(locale, `/${page}`, title, t(locale, "{title} — Discover glassware and collections from JJGLASS.", {
    title
  }));
}
export default async function Page({
  params
}: {
  params: Promise<{
    locale: string;
    page: string;
  }>;
}) {
  const {
    locale,
    page
  } = await params;
  if (!isLocale(locale) || !pageNames.includes(page as PageName)) notFound();
  if (page === 'studio') redirect(cmsPath(locale));
  if (page === 'products' || page === 'wishlist') return <Suspense>
    <ProductListing locale={locale} wishlist={page === 'wishlist'} />
  </Suspense>;
  if (page === 'cart' || page === 'checkout') return <Commerce locale={locale} mode={page} />;
  return <ContentPages locale={locale} page={page as 'brands' | 'catalog' | 'about' | 'stores' | 'contact' | 'inspiration'} />;
}
