import { notFound } from 'next/navigation';
import Home from '@/components/Home';
import { isLocale, t } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
export async function generateMetadata({
  params
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const {
    locale
  } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, '', t(locale, "Glassware for home and business"), t(locale, "Discover drinkware, stemware, vases, glass jars and glassware collections at JJGLASS."));
}
export default async function Page({
  params
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const {
    locale
  } = await params;
  if (!isLocale(locale)) notFound();
  return <>
    <Home locale={locale} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'JJGLASS',
        url: 'https://jjglass.com',
        logo: 'https://jjglass.com/images/logo.png'
      }).replace(/</g, '\\u003c')
    }} />
  </>;
}
