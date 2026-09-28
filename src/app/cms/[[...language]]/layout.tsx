import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { parseCmsRoute } from '@/lib/cms-routing';
import '../../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jjglass.com'),
  title: {
    default: 'JJGLASS Studio',
    template: '%s | JJGLASS Studio'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default async function CmsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ language?: string[] }>;
}) {
  const { language = [] } = await params;
  const route = parseCmsRoute(language);
  if (!route) notFound();

  return <html lang={route.locale} data-scroll-behavior="smooth">
    <body>{children}</body>
  </html>;
}
