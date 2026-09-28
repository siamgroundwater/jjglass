'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCmsPresentationSeed, CMS_STORAGE_KEY, LEGACY_CMS_STORAGE_KEY, normalizeCmsData, PREVIOUS_CMS_STORAGE_KEY } from '@/lib/cms-data';
import { cmsCopy } from '@/lib/cms-copy';
import { cmsRoutePath } from '@/lib/cms-routing';
import { purgeExpiredTrash } from '@/lib/cms-trash';
import { cmsId, isCmsView, type CmsAction, type CmsCollectionKind, type CmsData, type CmsView } from '@/lib/cms-types';
import { cmsPath, languageConfig, nextLocale, type Locale, type LocalizedText, storefrontPrefix } from '@/lib/i18n';
import Icon, { type IconName } from '../Icon';
import CmsDashboard from './CmsDashboard';
import { CmsProducts, CmsCollections } from './CmsProducts';
import { CmsOrders, CmsCustomers } from './CmsOrders';
import { CmsContent, CmsStores, CmsSettings } from './CmsContent';
import CmsMedia from './CmsMedia';
import CmsTrash from './CmsTrash';
import CmsInventory from './CmsInventory';
import { cmsInventoryCopy } from '@/lib/cms-inventory-copy';
import { CmsDialog, CmsSaveErrorContext } from './CmsUI';
import s from './CmsApp.module.css';

const navigation: { view: CmsView; icon: IconName }[] = [
  { view: 'overview', icon: 'grid' }, { view: 'products', icon: 'bag' }, { view: 'inventory', icon: 'filter' }, { view: 'collections', icon: 'filter' },
  { view: 'orders', icon: 'book' }, { view: 'customers', icon: 'heart' }, { view: 'content', icon: 'globe' },
  { view: 'stores', icon: 'pin' }, { view: 'media', icon: 'grid' }, { view: 'trash', icon: 'trash' }, { view: 'settings', icon: 'menu' }
];

export default function CmsApp({ locale, view: routeView = 'overview', action, itemId, kind, routePath = '' }: { locale: Locale; view?: CmsView; action?: CmsAction; itemId?: string; kind?: CmsCollectionKind; routePath?: string }) {
  const c = cmsCopy[locale];
  const router = useRouter();
  const params = useSearchParams();
  const requestedView = params.get('view');
  const view = requestedView && isCmsView(requestedView) ? requestedView : routeView;
  const [data, setData] = useState<CmsData>(createCmsPresentationSeed);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastPersisted = useRef<string | null>(null);
  const changedInAnotherTab = useRef(false);
  const pendingSnapshot = useRef<{ raw: string | null; data: CmsData } | null>(null);
  const previousRoute = useRef({ view, action });
  const dirty = useRef(false);
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  const setDirty = useCallback((value: boolean) => { dirty.current = value; }, []);
  const allowLeave = (leave: () => void) => {
    if (!dirty.current) return true;
    setPendingLeave(() => leave);
    setMobileOpen(false);
    return false;
  };

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  const acceptCurrentSnapshot = useCallback((): boolean => {
    try {
      const current = localStorage.getItem(CMS_STORAGE_KEY);
      const normalized = current === null ? createCmsPresentationSeed() : normalizeCmsData(JSON.parse(current) as unknown);
      if (!normalized) { setError(c.recovery); return false; }
      const cleaned = purgeExpiredTrash(normalized);
      changedInAnotherTab.current = true;
      pendingSnapshot.current = { raw: current, data: cleaned };
      setData(cleaned);
      return true;
    } catch { setError(c.recovery); return false; }
  }, [c.recovery]);

  useEffect(() => {
    changedInAnotherTab.current = false;
    pendingSnapshot.current = null;
    try {
      const current = localStorage.getItem(CMS_STORAGE_KEY);
      const previous = current === null ? localStorage.getItem(PREVIOUS_CMS_STORAGE_KEY) : null;
      const legacy = current === null && previous === null ? localStorage.getItem(LEGACY_CMS_STORAGE_KEY) : null;
      const stored = current ?? previous ?? legacy;
      lastPersisted.current = current;
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        const normalized = normalizeCmsData(parsed);
        if (normalized) {
          const cleaned = purgeExpiredTrash(normalized);
          setData(cleaned);
          if (current === null || cleaned !== normalized) {
            if (localStorage.getItem(CMS_STORAGE_KEY) !== current) {
              changedInAnotherTab.current = true;
              setError(c.staleData);
            } else {
              const serialized = JSON.stringify(cleaned);
              try {
                localStorage.setItem(CMS_STORAGE_KEY, serialized);
                lastPersisted.current = serialized;
                try {
                  if (previous !== null) localStorage.removeItem(PREVIOUS_CMS_STORAGE_KEY);
                  if (legacy !== null) localStorage.removeItem(LEGACY_CMS_STORAGE_KEY);
                } catch { /* v3 is saved; old keys can be removed on a later save. */ }
              } catch { setError(c.storageError); }
            }
          }
        } else setError(c.recovery);
      }
    } catch { setError(c.recovery); }
    setReady(true);
  }, [c.recovery, c.storageError]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CMS_STORAGE_KEY && event.key !== null) return;
      setNotice('');
      if (!action && view !== 'settings') {
        if (!acceptCurrentSnapshot()) changedInAnotherTab.current = true;
        return;
      }
      changedInAnotherTab.current = true;
      pendingSnapshot.current = null;
      try {
        const current = localStorage.getItem(CMS_STORAGE_KEY);
        if (current === null) { setData(createCmsPresentationSeed()); setError(''); return; }
        const normalized = normalizeCmsData(JSON.parse(current) as unknown);
        if (normalized) { setData(purgeExpiredTrash(normalized)); setError(''); }
        else setError(c.recovery);
      } catch { setError(c.recovery); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [action, view, acceptCurrentSnapshot, c.recovery]);

  useEffect(() => {
    const leftAction = !!previousRoute.current.action && !action;
    const changedView = previousRoute.current.view !== view;
    if (!action && changedInAnotherTab.current && !pendingSnapshot.current && (view !== 'settings' || leftAction || changedView)) acceptCurrentSnapshot();
    previousRoute.current = { view, action };
  }, [action, view, acceptCurrentSnapshot]);

  useEffect(() => {
    const pending = pendingSnapshot.current;
    if (!pending || pending.data !== data || action) return;
    try {
      if (localStorage.getItem(CMS_STORAGE_KEY) !== pending.raw) {
        pendingSnapshot.current = null;
        setError(c.staleData);
        return;
      }
      lastPersisted.current = pending.raw;
      changedInAnotherTab.current = false;
      pendingSnapshot.current = null;
      setError(''); setSaveError('');
    } catch { pendingSnapshot.current = null; setError(c.recovery); }
  }, [data, action, view, c.staleData, c.recovery]);

  useEffect(() => {
    if (!ready) return;
    const expireTrash = () => {
      if (changedInAnotherTab.current) return;
      const cleaned = purgeExpiredTrash(data);
      if (cleaned === data) return;
      try {
        if (localStorage.getItem(CMS_STORAGE_KEY) !== lastPersisted.current) {
          changedInAnotherTab.current = true;
          setError(c.staleData);
          return;
        }
        const serialized = JSON.stringify(cleaned);
        localStorage.setItem(CMS_STORAGE_KEY, serialized);
        lastPersisted.current = serialized;
        setData(cleaned);
      } catch { setError(c.storageError); }
    };
    const timer = window.setInterval(expireTrash, 60_000);
    window.addEventListener('focus', expireTrash);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', expireTrash); };
  }, [ready, data, c.staleData, c.storageError]);

  useEffect(() => {
    if (requestedView !== null) router.replace(cmsPath(locale, view), { scroll: false });
  }, [locale, requestedView, router, view]);

  const navigate = (next: CmsView) => {
    if (!allowLeave(() => navigate(next))) return;
    if (changedInAnotherTab.current && !pendingSnapshot.current && (next !== view || action)) acceptCurrentSnapshot();
    router.push(cmsPath(locale, next), { scroll: false });
    setMobileOpen(false);
    setSaveError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openAction = (nextAction: CmsAction, nextItemId?: string, nextKind?: CmsCollectionKind) => {
    if (!allowLeave(() => openAction(nextAction, nextItemId, nextKind))) return;
    router.push(cmsRoutePath({ locale, view, action: nextAction, itemId: nextItemId, kind: nextKind }), { scroll: false });
    setSaveError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const actionPath = (nextAction: CmsAction, nextItemId?: string, nextKind?: CmsCollectionKind) => cmsRoutePath({ locale, view, action: nextAction, itemId: nextItemId, kind: nextKind });

  const closeAction = () => {
    if (!allowLeave(closeAction)) return;
    if (changedInAnotherTab.current && !pendingSnapshot.current) acceptCurrentSnapshot();
    router.push(cmsPath(locale, view), { scroll: false });
    setSaveError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  function save(next: CmsData, message: LocalizedText = { th: cmsCopy.th.saved, en: cmsCopy.en.saved }): boolean {
    const activity = { id: cmsId('activity'), date: new Date().toISOString(), text: message };
    const cleaned = purgeExpiredTrash(next);
    const saved: CmsData = { ...cleaned, activity: [activity, ...cleaned.activity].slice(0, 30) };
    try {
      if (changedInAnotherTab.current || localStorage.getItem(CMS_STORAGE_KEY) !== lastPersisted.current) {
        changedInAnotherTab.current = true;
        setError(c.staleData); setSaveError(c.staleData);
        return false;
      }
      const serialized = JSON.stringify(saved);
      localStorage.setItem(CMS_STORAGE_KEY, serialized);
      lastPersisted.current = serialized;
      dirty.current = false;
      setData(saved); setNotice(message[locale]); setError(''); setSaveError('');
      try { localStorage.removeItem(PREVIOUS_CMS_STORAGE_KEY); localStorage.removeItem(LEGACY_CMS_STORAGE_KEY); } catch { /* v3 save has succeeded; legacy cleanup can retry later. */ }
      return true;
    } catch { setError(c.storageError); setSaveError(c.storageError); return false; }
  }

  function reset() {
    const seed = createCmsPresentationSeed();
    if (save(seed, { th: cmsCopy.th.resetDone, en: cmsCopy.en.resetDone })) closeAction();
  }

  function exportData() {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url; link.download = 'jjglass-cms-demo.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const navItems = <nav className={s.nav} aria-label={c.workspace}>{navigation.map(item => <button key={item.view} type="button" className={view === item.view ? s.active : ''} aria-current={view === item.view ? 'page' : undefined} onClick={() => navigate(item.view)}><Icon name={item.icon} size={20} /><span>{c[item.view]}</span>{item.view === 'orders' && <b>{data.orders.filter(order => order.status === 'pending').length}</b>}{item.view === 'trash' && data.trash.length > 0 && <b>{data.trash.length}</b>}</button>)}</nav>;
  const props = { locale, data, save, routeAction: action, routeItemId: itemId, routeKind: kind, openAction, actionPath, closeAction, setDirty };
  const panelKey = routePath || cmsPath(locale, view);
  const languagePath = cmsRoutePath({ locale: nextLocale(locale), view, action, itemId, kind });

  return <CmsSaveErrorContext.Provider value={saveError}><div className={s.shell}>
    <a href="#cms-main" className={s.skip}>{c.skipToContent}</a>
    <div className={s.workspace}>
      <header className={s.header}>
        <div className={s.breadcrumb}><button className={s.menuButton} aria-label={c.menu} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><span className={s.breadcrumbRoot}>{data.settings.siteName} Studio <span>/</span></span><strong>{c[view]}</strong></div>
        <div className={s.headerActions}><Link className={s.language} href={languagePath} onClick={event => { if (!allowLeave(() => router.push(languagePath))) event.preventDefault(); }} aria-label={languageConfig.switchLabels[nextLocale(locale)]}><Icon name="globe" size={17} />{languageConfig.shortLabels[locale]}</Link><div className={s.avatar} title={c.demoAccount}>JJ</div></div>
      </header>
      <main id="cms-main" className={s.main}>
        {pendingLeave && <section className={s.unsavedPrompt} role="alert" aria-label={cmsInventoryCopy[locale].changed}><p>{cmsInventoryCopy[locale].leave}</p><div><button autoFocus onClick={() => setPendingLeave(null)}>{c.cancel}</button><button onClick={() => { dirty.current = false; setPendingLeave(null); pendingLeave(); }}>{cmsInventoryCopy[locale].discard}</button></div></section>}
        {!ready ? <div className={s.loading}>{c.loading}</div> : <>
          {error && <div role="alert" className={s.errorNotice}><span>{error}</span><button onClick={() => setError('')} aria-label={c.dismiss}><Icon name="close" size={18} /></button></div>}
          {notice && <div role="status" className={s.notice}><Icon name="check" size={18} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label={c.dismiss}><Icon name="close" size={18} /></button></div>}
          {!action && !['overview', 'products', 'inventory', 'collections'].includes(view) && <div className={s.pageTitle}><div><p>{c.storeManagement}</p><h1>{c[view]}</h1></div><span className={s.savedLabel}><span />{c.localSaved}</span></div>}
          {view === 'overview' && <CmsDashboard locale={locale} data={data} navigate={navigate} />}
          {view === 'products' && <CmsProducts key={panelKey} {...props} />}
          {view === 'inventory' && <CmsInventory key={panelKey} {...props} />}
          {view === 'collections' && <CmsCollections key={panelKey} {...props} />}
          {view === 'orders' && <CmsOrders key={panelKey} {...props} />}
          {view === 'customers' && <CmsCustomers key={panelKey} {...props} />}
          {view === 'content' && <CmsContent key={panelKey} {...props} />}
          {view === 'stores' && <CmsStores key={panelKey} {...props} />}
          {view === 'media' && <CmsMedia key={panelKey} {...props} />}
          {view === 'trash' && <CmsTrash key={panelKey} {...props} />}
          {view === 'settings' && <CmsSettings key={panelKey} {...props} onReset={reset} onExport={exportData} />}
          <footer className={s.footer}><span>{data.settings.siteName} Studio</span><span>{c.demo}</span></footer>
        </>}
      </main>
    </div>
    {mobileOpen && <CmsDialog locale={locale} title={c.menu} onClose={() => setMobileOpen(false)} drawer><div className={s.drawerContent}>
      <Link href={cmsPath(locale)} className={s.drawerBrand} onClick={event => { if (!allowLeave(() => router.push(cmsPath(locale)))) event.preventDefault(); else setMobileOpen(false); }}><img src="/images/logo.png" width={165} height={50} alt="JJGLASS" /><span>STUDIO</span></Link>
      <p className={s.navLabel}>{c.workspace}</p>{navItems}
      <div className={s.drawerBottom}><span className={s.statusDot} /><div><strong>{c.demo}</strong><span>{c.localSaved}</span></div></div>
      <Link href={storefrontPrefix(locale) || '/'} className={s.drawerSiteLink} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={18} />{c.viewSite}<Icon name="arrow" size={16} /></Link>
    </div></CmsDialog>}
  </div></CmsSaveErrorContext.Provider>;
}
