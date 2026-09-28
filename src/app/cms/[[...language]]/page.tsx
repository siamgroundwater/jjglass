import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { AdminDemo } from '@/components/AdminDemo';
import { cmsCopy } from '@/lib/cms-copy';
import { cmsRoutePath, cmsStaticParams, parseCmsRoute } from '@/lib/cms-routing';
import { cmsPath } from '@/lib/i18n';

export function generateStaticParams() {
  return cmsStaticParams();
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ language?: string[] }>;
}) {
  const { language = [] } = await params;
  const route = parseCmsRoute(language);
  if (!route) return {};
  return { title: cmsCopy[route.locale][route.view] };
}

export default async function CmsPage({
  params
}: {
  params: Promise<{ language?: string[] }>;
}) {
  const { language = [] } = await params;
  const route = parseCmsRoute(language);
  if (!route) notFound();
  if (!route.canonical) redirect(cmsPath(route.locale, route.view));

  return <Suspense><AdminDemo locale={route.locale} view={route.view} action={route.action} itemId={route.itemId} kind={route.kind} routePath={cmsRoutePath(route)} /></Suspense>;
}
