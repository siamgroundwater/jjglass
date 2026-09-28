import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, languageConfig } from '@/lib/i18n';
import { ShopProvider } from '@/components/ShopProvider';
import SiteShell from '@/components/SiteShell';
import '../globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jjglass.com'),
  title: {
    default: 'JJGLASS | Beautiful glassware for everyday living',
    template: '%s | JJGLASS'
  },
  robots: {
    index: false,
    follow: false
  }
};
export function generateStaticParams() {
  return languageConfig.order.map(locale => ({
    locale
  }));
}
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}) {
  const {
    locale
  } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale} data-scroll-behavior="smooth">
    <body>
      <ShopProvider>
        <SiteShell locale={locale}>{children}</SiteShell>
      </ShopProvider>
    </body>
  </html>;
}
