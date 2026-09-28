import { cmsViews, isCmsView, type CmsAction, type CmsCollectionKind, type CmsView } from './cms-types';
import { isLocale, languageConfig, type Locale } from './i18n';

export type CmsRoute = {
  locale: Locale;
  view: CmsView;
  action?: CmsAction;
  itemId?: string;
  kind?: CmsCollectionKind;
  canonical: boolean;
};

const collectionKinds: CmsCollectionKind[] = ['categories', 'brands'];
const recordActions: Partial<Record<CmsView, CmsAction[]>> = {
  products: ['new', 'edit', 'delete', 'duplicate', 'archive'],
  orders: ['edit'],
  customers: ['new', 'edit'],
  content: ['new', 'edit', 'delete'],
  stores: ['new', 'edit', 'delete'],
  media: ['upload', 'edit', 'delete'],
  trash: ['restore', 'delete'],
  settings: ['reset']
};

export function parseCmsRoute(segments: string[] = []): CmsRoute | null {
  let locale: Locale = languageConfig.default;
  let routeSegments = segments;

  if (segments[0] && isLocale(segments[0])) {
    if (segments[0] === languageConfig.default) return null;
    locale = segments[0];
    routeSegments = segments.slice(1);
  }

  if (routeSegments.length === 0) return { locale, view: 'overview', canonical: true };

  const view = routeSegments[0];
  if (!isCmsView(view)) return null;
  const rest = routeSegments.slice(1);
  if (rest.length === 0) return { locale, view, canonical: view !== 'overview' };
  if (view === 'overview') return null;

  if (view === 'collections') {
    const kind = rest[0] as CmsCollectionKind;
    if (!collectionKinds.includes(kind)) return null;
    if (rest.length === 2 && rest[1] === 'new') return { locale, view, kind, action: 'new', canonical: true };
    if (rest.length === 3 && rest[1] && ['edit', 'archive'].includes(rest[2])) return { locale, view, kind, itemId: rest[1], action: rest[2] as CmsAction, canonical: true };
    return null;
  }

  const actions = recordActions[view];
  if (!actions) return null;
  if (rest.length === 1 && actions.includes(rest[0] as CmsAction) && ['new', 'upload', 'reset'].includes(rest[0])) return { locale, view, action: rest[0] as CmsAction, canonical: true };
  if (rest.length === 2 && rest[0] && actions.includes(rest[1] as CmsAction) && !['new', 'upload', 'reset'].includes(rest[1])) return { locale, view, itemId: rest[0], action: rest[1] as CmsAction, canonical: true };
  return null;
}

export function cmsRoutePath(route: Omit<CmsRoute, 'canonical'>): string {
  const localePrefix = route.locale === languageConfig.default ? '/cms' : `/cms/${route.locale}`;
  const base = route.view === 'overview' ? localePrefix : `${localePrefix}/${route.view}`;
  if (!route.action) return base;
  if (route.view === 'collections') return route.action === 'new'
    ? `${base}/${route.kind}/new`
    : `${base}/${route.kind}/${encodeURIComponent(route.itemId || '')}/${route.action}`;
  if (['new', 'upload', 'reset'].includes(route.action)) return `${base}/${route.action}`;
  return `${base}/${encodeURIComponent(route.itemId || '')}/${route.action}`;
}

export function cmsStaticParams(): { language: string[] }[] {
  return languageConfig.order.flatMap(locale => {
    const localePrefix = locale === languageConfig.default ? [] : [locale];
    return [
      { language: localePrefix },
      ...cmsViews
        .filter(view => view !== 'overview')
        .map(view => ({ language: [...localePrefix, view] }))
    ];
  });
}
